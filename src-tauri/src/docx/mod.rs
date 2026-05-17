use docx_rs::*;
use serde_json::{self, json};
use std::collections::HashMap;
use std::fs;
use std::io::Read;

fn is_tibetan_text(text: &str) -> bool {
    text.chars().any(|c| ('\u{0F00}'..='\u{0FFF}').contains(&c))
}

// ============================================================
// DOCX Reader
// ============================================================

pub fn read_docx(path: &str) -> Result<serde_json::Value, String> {
    let mut file = fs::File::open(path).map_err(|e| format!("Failed to open file: {}", e))?;
    let mut buf = Vec::new();
    file.read_to_end(&mut buf)
        .map_err(|e| format!("Failed to read file: {}", e))?;

    let docx = docx_rs::read_docx(&buf).map_err(|e| format!("Failed to parse DOCX: {}", e))?;
    let json_str = docx.json();
    let docx_json: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse DOCX JSON: {}", e))?;

    let mut hyperlink_map: HashMap<String, String> = HashMap::new();
    if let Some(hyperlinks) = docx_json.get("hyperlinks").and_then(|h| h.as_array()) {
        for entry in hyperlinks {
            if let Some(arr) = entry.as_array() {
                if arr.len() >= 2 {
                    if let (Some(rid), Some(url)) = (arr[0].as_str(), arr[1].as_str()) {
                        hyperlink_map.insert(rid.to_string(), url.to_string());
                    }
                }
            }
        }
    }

    let mut num_format_map: HashMap<u64, HashMap<u64, String>> = HashMap::new();
    let mut num_to_abstract: HashMap<u64, u64> = HashMap::new();

    if let Some(numberings) = docx_json.get("numberings") {
        if let Some(nums) = numberings.get("numberings").and_then(|n| n.as_array()) {
            for num in nums {
                if let (Some(id), Some(abstract_id)) = (
                    num.get("id").and_then(|i| i.as_u64()),
                    num.get("abstractNumId").and_then(|a| a.as_u64()),
                ) {
                    num_to_abstract.insert(id, abstract_id);
                }
            }
        }

        if let Some(abstract_nums) = numberings.get("abstractNums").and_then(|a| a.as_array()) {
            for abs_num in abstract_nums {
                if let Some(abs_id) = abs_num.get("id").and_then(|i| i.as_u64()) {
                    let mut level_formats: HashMap<u64, String> = HashMap::new();
                    if let Some(levels) = abs_num.get("levels").and_then(|l| l.as_array()) {
                        for level in levels {
                            if let (Some(lvl), Some(format)) = (
                                level.get("level").and_then(|l| l.as_u64()),
                                level.get("format").and_then(|f| f.as_str()),
                            ) {
                                level_formats.insert(lvl, format.to_string());
                            }
                        }
                    }
                    num_format_map.insert(abs_id, level_formats);
                }
            }
        }
    }

    let ctx = ReadContext {
        hyperlink_map,
        num_to_abstract,
        num_format_map,
    };

    let mut tiptap_content: Vec<serde_json::Value> = Vec::new();

    if let Some(children) = docx_json
        .get("document")
        .and_then(|d| d.get("children"))
        .and_then(|c| c.as_array())
    {
        let mut i = 0;
        while i < children.len() {
            let child = &children[i];
            let child_type = child.get("type").and_then(|t| t.as_str()).unwrap_or("");

            match child_type {
                "paragraph" => {
                    if let Some(data) = child.get("data") {
                        let is_list = data
                            .get("hasNumbering")
                            .and_then(|h| h.as_bool())
                            .unwrap_or(false);

                        if is_list {
                            let (list_node, consumed) = collect_list_items(&children[i..], &ctx);
                            if let Some(node) = list_node {
                                tiptap_content.push(node);
                            }
                            i += consumed;
                            continue;
                        } else {
                            if let Some(node) = convert_paragraph(data, &ctx) {
                                tiptap_content.push(node);
                            }
                        }
                    }
                }
                "table" => {
                    if let Some(data) = child.get("data") {
                        if let Some(node) = convert_table(data, &ctx) {
                            tiptap_content.push(node);
                        }
                    }
                }
                _ => {}
            }
            i += 1;
        }
    }

    if tiptap_content.is_empty() {
        tiptap_content.push(json!({
            "type": "paragraph",
            "content": []
        }));
    }

    Ok(json!({
        "type": "doc",
        "content": tiptap_content
    }))
}

struct ReadContext {
    hyperlink_map: HashMap<String, String>,
    num_to_abstract: HashMap<u64, u64>,
    num_format_map: HashMap<u64, HashMap<u64, String>>,
}

impl ReadContext {
    fn get_list_format(&self, num_id: u64, level: u64) -> Option<&str> {
        let abstract_id = self.num_to_abstract.get(&num_id)?;
        let level_map = self.num_format_map.get(abstract_id)?;
        level_map.get(&level).map(|s| s.as_str())
    }
}

fn convert_paragraph(data: &serde_json::Value, ctx: &ReadContext) -> Option<serde_json::Value> {
    let property = data.get("property");

    let style = property
        .and_then(|p| p.get("style"))
        .and_then(|s| s.as_str())
        .unwrap_or("");

    let heading_level = match style {
        s if s.eq_ignore_ascii_case("heading1") || s.eq_ignore_ascii_case("heading 1") => Some(1),
        s if s.eq_ignore_ascii_case("heading2") || s.eq_ignore_ascii_case("heading 2") => Some(2),
        s if s.eq_ignore_ascii_case("heading3") || s.eq_ignore_ascii_case("heading 3") => Some(3),
        s if s.eq_ignore_ascii_case("heading4") || s.eq_ignore_ascii_case("heading 4") => Some(4),
        s if s.eq_ignore_ascii_case("heading5") || s.eq_ignore_ascii_case("heading 5") => Some(5),
        s if s.eq_ignore_ascii_case("heading6") || s.eq_ignore_ascii_case("heading 6") => Some(6),
        s if s.starts_with("Heading") || s.starts_with("heading") => {
            s.chars().last().and_then(|c| c.to_digit(10)).map(|d| d as u64)
        }
        _ => None,
    };

    let alignment = property
        .and_then(|p| p.get("alignment"))
        .and_then(|a| a.as_str());

    let text_nodes = collect_inline_content(data, ctx);

    if let Some(level) = heading_level {
        let mut node = json!({
            "type": "heading",
            "attrs": { "level": level },
            "content": text_nodes
        });
        if let Some(align) = alignment {
            let align_val = normalize_alignment(align);
            node["attrs"]["textAlign"] = json!(align_val);
        }
        Some(node)
    } else {
        let mut node = json!({
            "type": "paragraph",
            "content": text_nodes
        });
        if let Some(align) = alignment {
            let align_val = normalize_alignment(align);
            node["attrs"] = json!({ "textAlign": align_val });
        }
        Some(node)
    }
}

fn normalize_alignment(align: &str) -> &str {
    match align {
        "both" | "justify" => "justify",
        a => a,
    }
}

fn collect_inline_content(
    para_data: &serde_json::Value,
    ctx: &ReadContext,
) -> Vec<serde_json::Value> {
    let mut text_nodes = Vec::new();

    let children = match para_data.get("children").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return text_nodes,
    };

    for child in children {
        let child_type = child.get("type").and_then(|t| t.as_str()).unwrap_or("");

        match child_type {
            "run" => {
                if let Some(run_data) = child.get("data") {
                    let marks = collect_run_marks(run_data);

                    if let Some(run_children) = run_data.get("children").and_then(|c| c.as_array())
                    {
                        for rc in run_children {
                            let rc_type = rc.get("type").and_then(|t| t.as_str()).unwrap_or("");
                            match rc_type {
                                "text" => {
                                    if let Some(text) = rc
                                        .get("data")
                                        .and_then(|d| d.get("text"))
                                        .and_then(|t| t.as_str())
                                    {
                                        if !text.is_empty() {
                                            let mut text_node = json!({
                                                "type": "text",
                                                "text": text
                                            });
                                            if !marks.is_empty() {
                                                text_node["marks"] = json!(marks);
                                            }
                                            text_nodes.push(text_node);
                                        }
                                    }
                                }
                                "break" => {
                                    let break_type = rc
                                        .get("data")
                                        .and_then(|d| d.get("breakType"))
                                        .and_then(|b| b.as_str())
                                        .unwrap_or("textWrapping");

                                    if break_type == "page" {
                                        // Page breaks handled at paragraph level
                                    } else {
                                        text_nodes.push(json!({ "type": "hardBreak" }));
                                    }
                                }
                                "tab" => {
                                    text_nodes.push(json!({
                                        "type": "text",
                                        "text": "\t"
                                    }));
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
            "hyperlink" => {
                if let Some(hl_data) = child.get("data") {
                    let url = hl_data
                        .get("rid")
                        .and_then(|r| r.as_str())
                        .and_then(|rid| ctx.hyperlink_map.get(rid))
                        .cloned()
                        .or_else(|| {
                            hl_data
                                .get("anchor")
                                .and_then(|a| a.as_str())
                                .map(|a| format!("#{}", a))
                        })
                        .unwrap_or_default();

                    if let Some(hl_children) = hl_data.get("children").and_then(|c| c.as_array()) {
                        for hc in hl_children {
                            if hc.get("type").and_then(|t| t.as_str()) == Some("run") {
                                if let Some(run_data) = hc.get("data") {
                                    let mut marks = collect_run_marks(run_data);
                                    marks.push(json!({
                                        "type": "link",
                                        "attrs": { "href": url, "target": "_blank" }
                                    }));

                                    if let Some(run_children) =
                                        run_data.get("children").and_then(|c| c.as_array())
                                    {
                                        for rc in run_children {
                                            if rc.get("type").and_then(|t| t.as_str())
                                                == Some("text")
                                            {
                                                if let Some(text) = rc
                                                    .get("data")
                                                    .and_then(|d| d.get("text"))
                                                    .and_then(|t| t.as_str())
                                                {
                                                    if !text.is_empty() {
                                                        let mut text_node = json!({
                                                            "type": "text",
                                                            "text": text
                                                        });
                                                        text_node["marks"] = json!(marks);
                                                        text_nodes.push(text_node);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }

    text_nodes
}

fn collect_run_marks(run_data: &serde_json::Value) -> Vec<serde_json::Value> {
    let mut marks = Vec::new();

    let prop = match run_data.get("runProperty") {
        Some(p) => p,
        None => return marks,
    };

    if prop.get("bold").and_then(|b| b.as_bool()).unwrap_or(false) {
        marks.push(json!({"type": "bold"}));
    }
    if prop.get("italic").and_then(|b| b.as_bool()).unwrap_or(false) {
        marks.push(json!({"type": "italic"}));
    }
    if let Some(underline) = prop.get("underline").and_then(|u| u.as_str()) {
        if underline != "none" {
            marks.push(json!({"type": "underline"}));
        }
    }
    if prop.get("strike").and_then(|b| b.as_bool()).unwrap_or(false)
        || prop
            .get("dstrike")
            .and_then(|b| b.as_bool())
            .unwrap_or(false)
    {
        marks.push(json!({"type": "strike"}));
    }
    if prop.get("vanish").and_then(|b| b.as_bool()).unwrap_or(false) {
        marks.push(json!({"type": "code"}));
    }

    if let Some(vert) = prop.get("vertAlign").and_then(|v| v.as_str()) {
        match vert {
            "superscript" => marks.push(json!({"type": "superscript"})),
            "subscript" => marks.push(json!({"type": "subscript"})),
            _ => {}
        }
    }

    // Read font size (half-points -> px string for textStyle mark)
    if let Some(sz) = prop.get("sz").and_then(|s| s.as_u64()) {
        let pt = sz / 2;
        if pt != 0 {
            marks.push(json!({
                "type": "textStyle",
                "attrs": { "fontSize": format!("{}px", pt) }
            }));
        }
    }

    marks
}

fn collect_list_items(
    children: &[serde_json::Value],
    ctx: &ReadContext,
) -> (Option<serde_json::Value>, usize) {
    if children.is_empty() {
        return (None, 0);
    }

    let first = &children[0];
    let first_data = match first.get("data") {
        Some(d) => d,
        None => return (None, 1),
    };

    let num_prop = first_data
        .get("property")
        .and_then(|p| p.get("numberingProperty"));
    let num_id = num_prop
        .and_then(|n| n.get("id"))
        .and_then(|i| i.as_u64())
        .unwrap_or(0);
    let first_level = num_prop
        .and_then(|n| n.get("level"))
        .and_then(|l| l.as_u64())
        .unwrap_or(0);

    let format = ctx.get_list_format(num_id, first_level).unwrap_or("bullet");
    let is_ordered = !matches!(format, "bullet");
    let list_type = if is_ordered {
        "orderedList"
    } else {
        "bulletList"
    };

    let mut items: Vec<serde_json::Value> = Vec::new();
    let mut consumed = 0;

    for child in children {
        let child_type = child.get("type").and_then(|t| t.as_str()).unwrap_or("");
        if child_type != "paragraph" {
            break;
        }
        let data = match child.get("data") {
            Some(d) => d,
            None => break,
        };

        let is_list = data
            .get("hasNumbering")
            .and_then(|h| h.as_bool())
            .unwrap_or(false);
        if !is_list {
            break;
        }

        let child_num_prop = data
            .get("property")
            .and_then(|p| p.get("numberingProperty"));
        let child_num_id = child_num_prop
            .and_then(|n| n.get("id"))
            .and_then(|i| i.as_u64())
            .unwrap_or(0);
        let child_level = child_num_prop
            .and_then(|n| n.get("level"))
            .and_then(|l| l.as_u64())
            .unwrap_or(0);
        let child_format = ctx.get_list_format(child_num_id, child_level).unwrap_or("bullet");
        let child_ordered = !matches!(child_format, "bullet");

        if child_ordered != is_ordered && child_level == first_level {
            break;
        }

        let text_nodes = collect_inline_content(data, ctx);
        items.push(json!({
            "type": "listItem",
            "content": [
                {
                    "type": "paragraph",
                    "content": text_nodes
                }
            ]
        }));

        consumed += 1;
    }

    if items.is_empty() {
        return (None, 1);
    }

    (
        Some(json!({
            "type": list_type,
            "content": items
        })),
        consumed,
    )
}

fn convert_table(data: &serde_json::Value, ctx: &ReadContext) -> Option<serde_json::Value> {
    let rows = data.get("rows").and_then(|r| r.as_array())?;

    let mut tiptap_rows = Vec::new();

    for (row_idx, row) in rows.iter().enumerate() {
        let cells = row.get("cells").and_then(|c| c.as_array());
        if cells.is_none() {
            continue;
        }

        let mut tiptap_cells = Vec::new();

        for cell in cells.unwrap() {
            let cell_children = cell.get("children").and_then(|c| c.as_array());
            let mut cell_content = Vec::new();

            if let Some(children) = cell_children {
                for child in children {
                    if child.get("type").and_then(|t| t.as_str()) == Some("paragraph") {
                        if let Some(para_data) = child.get("data") {
                            if let Some(node) = convert_paragraph(para_data, ctx) {
                                cell_content.push(node);
                            }
                        }
                    }
                }
            }

            if cell_content.is_empty() {
                cell_content.push(json!({ "type": "paragraph", "content": [] }));
            }

            let cell_type = if row_idx == 0 {
                "tableHeader"
            } else {
                "tableCell"
            };

            tiptap_cells.push(json!({
                "type": cell_type,
                "content": cell_content
            }));
        }

        tiptap_rows.push(json!({
            "type": "tableRow",
            "content": tiptap_cells
        }));
    }

    if tiptap_rows.is_empty() {
        return None;
    }

    Some(json!({
        "type": "table",
        "content": tiptap_rows
    }))
}

// ============================================================
// DOCX Writer
// ============================================================

struct WriteContext {
    _placeholder: (),
}

impl WriteContext {
    fn new() -> Self {
        WriteContext { _placeholder: () }
    }
}

pub fn write_docx(path: &str, content: &serde_json::Value) -> Result<(), String> {
    let mut docx = Docx::new();
    let mut ctx = WriteContext::new();

    // Set up bullet list numbering (abstractNumId=0, numId=1)
    let bullet_abstract = AbstractNumbering::new(0).add_level(
        Level::new(
            0,
            Start::new(1),
            NumberFormat::new("bullet"),
            LevelText::new("\u{2022}"),
            LevelJc::new("left"),
        )
        .indent(None, Some(SpecialIndentType::Hanging(360)), None, None),
    );
    docx = docx.add_abstract_numbering(bullet_abstract);
    docx = docx.add_numbering(Numbering::new(1, 0));

    // Set up ordered list numbering (abstractNumId=1, numId=2)
    let ordered_abstract = AbstractNumbering::new(1).add_level(
        Level::new(
            0,
            Start::new(1),
            NumberFormat::new("decimal"),
            LevelText::new("%1."),
            LevelJc::new("left"),
        )
        .indent(None, Some(SpecialIndentType::Hanging(360)), None, None),
    );
    docx = docx.add_abstract_numbering(ordered_abstract);
    docx = docx.add_numbering(Numbering::new(2, 1));

    if let Some(children) = content.get("content").and_then(|c| c.as_array()) {
        for child in children {
            if let Some(node_type) = child.get("type").and_then(|t| t.as_str()) {
                match node_type {
                    "paragraph" => {
                        let para = write_paragraph(child, &mut ctx);
                        docx = docx.add_paragraph(para);
                    }
                    "heading" => {
                        let level = child
                            .get("attrs")
                            .and_then(|a| a.get("level"))
                            .and_then(|l| l.as_u64())
                            .unwrap_or(1);

                        let style = format!("Heading{}", level);
                        let mut para = Paragraph::new().style(&style);
                        if let Some(align) = child
                            .get("attrs")
                            .and_then(|a| a.get("textAlign"))
                            .and_then(|a| a.as_str())
                        {
                            para = apply_alignment(para, align);
                        }
                        para = add_runs_to_paragraph(para, child, &mut ctx);
                        docx = docx.add_paragraph(para);
                    }
                    "bulletList" => {
                        docx = write_list(docx, child, false, 0, &mut ctx);
                    }
                    "orderedList" => {
                        docx = write_list(docx, child, true, 0, &mut ctx);
                    }
                    "taskList" => {
                        docx = write_list(docx, child, false, 0, &mut ctx);
                    }
                    "blockquote" => {
                        if let Some(bq_children) = child.get("content").and_then(|c| c.as_array())
                        {
                            for bq_child in bq_children {
                                let mut para = Paragraph::new();
                                para = para.indent(
                                    Some(720),
                                    None,
                                    None,
                                    None,
                                );
                                para = add_runs_to_paragraph(para, bq_child, &mut ctx);
                                docx = docx.add_paragraph(para);
                            }
                        }
                    }
                    "horizontalRule" => {
                        let para = Paragraph::new()
                            .add_run(Run::new().add_text("───────────────────────────────"));
                        docx = docx.add_paragraph(para);
                    }
                    "codeBlock" => {
                        if let Some(code_children) =
                            child.get("content").and_then(|c| c.as_array())
                        {
                            for code_child in code_children {
                                if let Some(text) =
                                    code_child.get("text").and_then(|t| t.as_str())
                                {
                                    for line in text.split('\n') {
                                        let run = Run::new()
                                            .add_text(line)
                                            .fonts(RunFonts::new().ascii("Courier New").hi_ansi("Courier New"))
                                            .size(20); // 10pt
                                        let para = Paragraph::new().add_run(run);
                                        docx = docx.add_paragraph(para);
                                    }
                                }
                            }
                        }
                    }
                    "table" => {
                        let table = write_table(child, &mut ctx);
                        docx = docx.add_table(table);
                        // Add empty paragraph after table (Word requires this)
                        docx = docx.add_paragraph(Paragraph::new());
                    }
                    _ => {}
                }
            }
        }
    }

    let file = fs::File::create(path).map_err(|e| format!("Failed to create file: {}", e))?;
    docx.build()
        .pack(file)
        .map_err(|e| format!("Failed to write DOCX: {}", e))?;

    Ok(())
}

fn write_paragraph(node: &serde_json::Value, ctx: &mut WriteContext) -> Paragraph {
    let mut para = Paragraph::new();
    if let Some(align) = node
        .get("attrs")
        .and_then(|a| a.get("textAlign"))
        .and_then(|a| a.as_str())
    {
        para = apply_alignment(para, align);
    }
    para = add_runs_to_paragraph(para, node, ctx);
    para
}

fn apply_alignment(para: Paragraph, align: &str) -> Paragraph {
    match align {
        "center" => para.align(AlignmentType::Center),
        "right" => para.align(AlignmentType::Right),
        "justify" => para.align(AlignmentType::Both),
        _ => para.align(AlignmentType::Left),
    }
}

fn add_runs_to_paragraph(
    mut para: Paragraph,
    node: &serde_json::Value,
    _ctx: &mut WriteContext,
) -> Paragraph {
    let children = match node.get("content").and_then(|c| c.as_array()) {
        Some(c) => c,
        None => return para,
    };

    for child in children {
        let child_type = match child.get("type").and_then(|t| t.as_str()) {
            Some(t) => t,
            None => continue,
        };

        match child_type {
            "text" => {
                if let Some(text) = child.get("text").and_then(|t| t.as_str()) {
                    let marks = child.get("marks").and_then(|m| m.as_array());

                    // Check if this text has a link mark
                    let link_url = marks.and_then(|ms| {
                        ms.iter().find_map(|m| {
                            if m.get("type").and_then(|t| t.as_str()) == Some("link") {
                                m.get("attrs")
                                    .and_then(|a| a.get("href"))
                                    .and_then(|h| h.as_str())
                                    .map(|s| s.to_string())
                            } else {
                                None
                            }
                        })
                    });

                    if let Some(url) = link_url {
                        let mut run = Run::new().add_text(text);
                        run = run.color("0563C1");
                        run = run.underline("single");
                        run = apply_marks_to_run(run, marks, text);
                        let hyperlink = Hyperlink::new(url, HyperlinkType::External).add_run(run);
                        para = para.add_hyperlink(hyperlink);
                    } else {
                        let mut run = Run::new().add_text(text);
                        run = apply_marks_to_run(run, marks, text);
                        para = para.add_run(run);
                    }
                }
            }
            "hardBreak" => {
                para = para.add_run(Run::new().add_break(BreakType::TextWrapping));
            }
            _ => {}
        }
    }
    para
}

fn apply_marks_to_run(
    mut run: Run,
    marks: Option<&Vec<serde_json::Value>>,
    text: &str,
) -> Run {
    if is_tibetan_text(text) {
        run = run.fonts(
            RunFonts::new()
                .east_asia("Noto Serif Tibetan")
                .cs("Noto Serif Tibetan"),
        );
    }

    let marks = match marks {
        Some(m) => m,
        None => return run,
    };

    for mark in marks {
        let mark_type = match mark.get("type").and_then(|t| t.as_str()) {
            Some(t) => t,
            None => continue,
        };

        match mark_type {
            "bold" => run = run.bold(),
            "italic" => run = run.italic(),
            "underline" => run = run.underline("single"),
            "strike" => run = run.strike(),
            // superscript/subscript not supported by docx-rs 0.4 write API
            "superscript" | "subscript" => {}
            "code" => {
                run = run.fonts(RunFonts::new().ascii("Courier New").hi_ansi("Courier New"));
            }
            "textStyle" => {
                if let Some(font_size) = mark
                    .get("attrs")
                    .and_then(|a| a.get("fontSize"))
                    .and_then(|f| f.as_str())
                {
                    // Parse "18px" -> 36 half-points
                    if let Some(px_str) = font_size.strip_suffix("px") {
                        if let Ok(px) = px_str.parse::<u32>() {
                            // px ≈ pt for screen, convert to half-points
                            run = run.size(px as usize * 2);
                        }
                    } else if let Some(pt_str) = font_size.strip_suffix("pt") {
                        if let Ok(pt) = pt_str.parse::<u32>() {
                            run = run.size(pt as usize * 2);
                        }
                    }
                }
            }
            "highlight" => {
                if let Some(color) = mark
                    .get("attrs")
                    .and_then(|a| a.get("color"))
                    .and_then(|c| c.as_str())
                {
                    let highlight_color = match color {
                        "#FFFF00" | "yellow" => "yellow",
                        "#00FF00" | "green" => "green",
                        "#00FFFF" | "cyan" => "cyan",
                        "#FF00FF" | "magenta" => "magenta",
                        "#0000FF" | "blue" => "blue",
                        "#FF0000" | "red" => "red",
                        _ => "yellow",
                    };
                    run = run.highlight(highlight_color);
                }
            }
            // Skip link marks (handled separately above)
            "link" => {}
            _ => {}
        }
    }
    run
}

fn write_list(
    mut docx: Docx,
    node: &serde_json::Value,
    ordered: bool,
    depth: u32,
    ctx: &mut WriteContext,
) -> Docx {
    let num_id = if ordered { 2 } else { 1 };

    if let Some(items) = node.get("content").and_then(|c| c.as_array()) {
        for item in items {
            if let Some(item_content) = item.get("content").and_then(|c| c.as_array()) {
                for inner_node in item_content {
                    let inner_type = inner_node
                        .get("type")
                        .and_then(|t| t.as_str())
                        .unwrap_or("");

                    match inner_type {
                        "paragraph" => {
                            let mut para = Paragraph::new()
                                .numbering(NumberingId::new(num_id), IndentLevel::new(depth as usize));
                            para = add_runs_to_paragraph(para, inner_node, ctx);
                            docx = docx.add_paragraph(para);
                        }
                        "bulletList" => {
                            docx = write_list(docx, inner_node, false, depth + 1, ctx);
                        }
                        "orderedList" => {
                            docx = write_list(docx, inner_node, true, depth + 1, ctx);
                        }
                        "taskList" => {
                            docx = write_list(docx, inner_node, false, depth + 1, ctx);
                        }
                        _ => {
                            let mut para = Paragraph::new()
                                .numbering(NumberingId::new(num_id), IndentLevel::new(depth as usize));
                            para = add_runs_to_paragraph(para, inner_node, ctx);
                            docx = docx.add_paragraph(para);
                        }
                    }
                }
            }
        }
    }
    docx
}

fn write_table(node: &serde_json::Value, ctx: &mut WriteContext) -> Table {
    let mut rows_vec: Vec<TableRow> = Vec::new();

    if let Some(rows) = node.get("content").and_then(|c| c.as_array()) {
        for row_node in rows {
            if row_node.get("type").and_then(|t| t.as_str()) != Some("tableRow") {
                continue;
            }

            let mut cells_vec: Vec<TableCell> = Vec::new();

            if let Some(cells) = row_node.get("content").and_then(|c| c.as_array()) {
                for cell_node in cells {
                    let cell_type = cell_node.get("type").and_then(|t| t.as_str()).unwrap_or("");
                    if cell_type != "tableCell" && cell_type != "tableHeader" {
                        continue;
                    }

                    let mut cell = TableCell::new();

                    if let Some(cell_content) = cell_node.get("content").and_then(|c| c.as_array())
                    {
                        for inner in cell_content {
                            let para = write_paragraph(inner, ctx);
                            cell = cell.add_paragraph(para);
                        }
                    } else {
                        cell = cell.add_paragraph(Paragraph::new());
                    }

                    cells_vec.push(cell);
                }
            }

            rows_vec.push(TableRow::new(cells_vec));
        }
    }

    Table::new(rows_vec)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::env;

    fn test_path(name: &str) -> String {
        let mut p = env::temp_dir();
        p.push(format!("termatype_test_{}.docx", name));
        p.to_string_lossy().to_string()
    }

    #[test]
    fn round_trip_basic() {
        let doc = json!({
            "type": "doc",
            "content": [
                {
                    "type": "heading",
                    "attrs": { "level": 1 },
                    "content": [{ "type": "text", "text": "Test Heading" }]
                },
                {
                    "type": "paragraph",
                    "content": [
                        { "type": "text", "text": "Normal text " },
                        { "type": "text", "text": "bold text", "marks": [{ "type": "bold" }] },
                        { "type": "text", "text": " and " },
                        { "type": "text", "text": "italic text", "marks": [{ "type": "italic" }] }
                    ]
                },
                {
                    "type": "paragraph",
                    "content": [
                        { "type": "text", "text": "underlined", "marks": [{ "type": "underline" }] },
                        { "type": "text", "text": " and " },
                        { "type": "text", "text": "strikethrough", "marks": [{ "type": "strike" }] }
                    ]
                }
            ]
        });

        let path = test_path("basic");
        write_docx(&path, &doc).expect("write_docx failed");
        let result = read_docx(&path).expect("read_docx failed");
        let _ = fs::remove_file(&path);

        let content = result.get("content").and_then(|c| c.as_array()).expect("no content");
        assert!(content.len() >= 3, "Expected at least 3 nodes, got {}", content.len());

        assert_eq!(content[0]["type"], "heading");
        assert_eq!(content[0]["attrs"]["level"], 1);

        assert_eq!(content[1]["type"], "paragraph");
        let p1_content = content[1]["content"].as_array().expect("no paragraph content");
        assert!(p1_content.iter().any(|n| n["text"] == "Normal text "));

        let bold_node = p1_content.iter().find(|n| n["text"] == "bold text").expect("no bold text");
        let bold_marks = bold_node["marks"].as_array().expect("no marks on bold");
        assert!(bold_marks.iter().any(|m| m["type"] == "bold"));

        let italic_node = p1_content.iter().find(|n| n["text"] == "italic text").expect("no italic text");
        let italic_marks = italic_node["marks"].as_array().expect("no marks on italic");
        assert!(italic_marks.iter().any(|m| m["type"] == "italic"));

        println!("round_trip_basic PASSED");
    }

    #[test]
    fn round_trip_tibetan() {
        let doc = json!({
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        { "type": "text", "text": "བོད་སྐད། Mixed Tibetan and English." }
                    ]
                }
            ]
        });

        let path = test_path("tibetan");
        write_docx(&path, &doc).expect("write_docx failed");
        let result = read_docx(&path).expect("read_docx failed");
        let _ = fs::remove_file(&path);

        let content = result["content"].as_array().expect("no content");
        let all_text: String = content.iter()
            .filter_map(|n| n["content"].as_array())
            .flatten()
            .filter_map(|n| n["text"].as_str())
            .collect::<Vec<_>>()
            .join("");

        assert!(all_text.contains("བོད་སྐད།"), "Tibetan text not found: {}", all_text);
        assert!(all_text.contains("English"), "English text not found: {}", all_text);
        println!("round_trip_tibetan PASSED");
    }

    #[test]
    fn round_trip_lists() {
        let doc = json!({
            "type": "doc",
            "content": [
                {
                    "type": "bulletList",
                    "content": [
                        {
                            "type": "listItem",
                            "content": [
                                { "type": "paragraph", "content": [{ "type": "text", "text": "Bullet one" }] }
                            ]
                        },
                        {
                            "type": "listItem",
                            "content": [
                                { "type": "paragraph", "content": [{ "type": "text", "text": "Bullet two" }] }
                            ]
                        }
                    ]
                },
                {
                    "type": "orderedList",
                    "content": [
                        {
                            "type": "listItem",
                            "content": [
                                { "type": "paragraph", "content": [{ "type": "text", "text": "First" }] }
                            ]
                        },
                        {
                            "type": "listItem",
                            "content": [
                                { "type": "paragraph", "content": [{ "type": "text", "text": "Second" }] }
                            ]
                        }
                    ]
                }
            ]
        });

        let path = test_path("lists");
        write_docx(&path, &doc).expect("write_docx failed");
        let result = read_docx(&path).expect("read_docx failed");
        let _ = fs::remove_file(&path);

        let content = result["content"].as_array().expect("no content");
        assert!(content.len() >= 2, "Expected at least 2 list nodes, got {}", content.len());

        let list_types: Vec<&str> = content.iter()
            .filter_map(|n| n["type"].as_str())
            .filter(|t| *t == "bulletList" || *t == "orderedList")
            .collect();
        assert!(list_types.contains(&"bulletList"), "No bullet list found. Types: {:?}", list_types);
        assert!(list_types.contains(&"orderedList"), "No ordered list found. Types: {:?}", list_types);

        println!("round_trip_lists PASSED");
    }

    #[test]
    fn round_trip_alignment() {
        let doc = json!({
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "center" },
                    "content": [{ "type": "text", "text": "Centered text" }]
                },
                {
                    "type": "paragraph",
                    "attrs": { "textAlign": "right" },
                    "content": [{ "type": "text", "text": "Right aligned" }]
                }
            ]
        });

        let path = test_path("alignment");
        write_docx(&path, &doc).expect("write_docx failed");
        let result = read_docx(&path).expect("read_docx failed");
        let _ = fs::remove_file(&path);

        let content = result["content"].as_array().expect("no content");
        let center_node = content.iter().find(|n| {
            n["content"].as_array()
                .map(|c| c.iter().any(|t| t["text"] == "Centered text"))
                .unwrap_or(false)
        }).expect("centered paragraph not found");
        assert_eq!(center_node["attrs"]["textAlign"], "center");

        println!("round_trip_alignment PASSED");
    }

    #[test]
    fn round_trip_font_size() {
        let doc = json!({
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {
                            "type": "text",
                            "text": "Big text",
                            "marks": [{
                                "type": "textStyle",
                                "attrs": { "fontSize": "24px" }
                            }]
                        }
                    ]
                }
            ]
        });

        let path = test_path("fontsize");
        write_docx(&path, &doc).expect("write_docx failed");
        let result = read_docx(&path).expect("read_docx failed");
        let _ = fs::remove_file(&path);

        let content = result["content"].as_array().expect("no content");
        let text_node = &content[0]["content"].as_array().expect("no content")[0];
        assert_eq!(text_node["text"], "Big text");

        let marks = text_node["marks"].as_array().expect("no marks");
        let ts_mark = marks.iter().find(|m| m["type"] == "textStyle").expect("no textStyle mark");
        let fs_val = ts_mark["attrs"]["fontSize"].as_str().expect("no fontSize");
        assert!(fs_val.contains("24"), "Expected 24px font size, got {}", fs_val);

        println!("round_trip_font_size PASSED");
    }

    #[test]
    fn write_docx_creates_valid_file() {
        let doc = json!({
            "type": "doc",
            "content": [
                {
                    "type": "heading",
                    "attrs": { "level": 1 },
                    "content": [{ "type": "text", "text": "TermaType Test" }]
                },
                {
                    "type": "paragraph",
                    "content": [{ "type": "text", "text": "Simple paragraph." }]
                },
                {
                    "type": "blockquote",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{ "type": "text", "text": "A blockquote." }]
                        }
                    ]
                },
                {
                    "type": "horizontalRule"
                },
                {
                    "type": "codeBlock",
                    "content": [{ "type": "text", "text": "fn main() {\n    println!(\"hello\");\n}" }]
                }
            ]
        });

        let path = test_path("valid");
        write_docx(&path, &doc).expect("write_docx failed");

        let metadata = fs::metadata(&path).expect("file not created");
        assert!(metadata.len() > 100, "DOCX file too small: {} bytes", metadata.len());

        let result = read_docx(&path).expect("read_docx of written file failed");
        let _ = fs::remove_file(&path);

        let content = result["content"].as_array().expect("no content");
        assert!(content.len() >= 3, "Expected multiple nodes, got {}", content.len());

        println!("write_docx_creates_valid_file PASSED");
    }
}
