"""Generate icon preview HTML with embedded base64 images."""
import base64
import os

base = os.path.join(os.path.dirname(__file__), "..")

files = {
    "icon": os.path.join(base, "src-tauri/icons/icon.png"),
    "s150": os.path.join(base, "src-tauri/icons/Square150x150Logo.png"),
    "s128": os.path.join(base, "src-tauri/icons/128x128.png"),
    "s32": os.path.join(base, "src-tauri/icons/32x32.png"),
}

data = {}
for name, path in files.items():
    with open(path, "rb") as f:
        data[name] = base64.b64encode(f.read()).decode()

html = f"""<!DOCTYPE html>
<html>
<head>
<title>TermaType Icon Preview</title>
<style>
body {{ background: #2a2520; color: #e8e4da; font-family: system-ui; display: flex; flex-direction: column; align-items: center; padding: 40px; gap: 40px; }}
h1 {{ font-size: 24px; font-weight: 400; }}
.row {{ display: flex; gap: 40px; align-items: end; }}
.icon-box {{ display: flex; flex-direction: column; align-items: center; gap: 12px; }}
.label {{ font-size: 13px; opacity: 0.6; }}
.context {{ display: flex; gap: 60px; margin-top: 20px; }}
.context-box {{ text-align: center; }}
.context-box h3 {{ font-size: 14px; margin-bottom: 12px; opacity: 0.5; }}
.taskbar {{ background: #1a1815; padding: 8px 20px; border-radius: 8px; display: flex; gap: 12px; align-items: center; }}
.taskbar img {{ width: 24px; height: 24px; }}
.taskbar-dot {{ width: 24px; height: 24px; background: #444; border-radius: 4px; }}
.dock {{ background: rgba(255,255,255,0.08); padding: 8px 16px; border-radius: 16px; display: flex; gap: 8px; align-items: center; }}
.dock img {{ width: 48px; height: 48px; border-radius: 10px; }}
.dock-dot {{ width: 48px; height: 48px; background: #555; border-radius: 10px; }}
</style>
</head>
<body>
<h1>TermaType Icon Preview</h1>
<div class="row">
  <div class="icon-box">
    <img src="data:image/png;base64,{data['icon']}" width="256" height="256">
    <span class="label">1024px (source)</span>
  </div>
  <div class="icon-box">
    <img src="data:image/png;base64,{data['s150']}" width="150" height="150">
    <span class="label">150px (Store tile)</span>
  </div>
  <div class="icon-box">
    <img src="data:image/png;base64,{data['s128']}" width="128" height="128">
    <span class="label">128px</span>
  </div>
  <div class="icon-box">
    <img src="data:image/png;base64,{data['s32']}" width="32" height="32">
    <span class="label">32px</span>
  </div>
</div>
<div class="context">
  <div class="context-box">
    <h3>Windows Taskbar</h3>
    <div class="taskbar">
      <div class="taskbar-dot"></div>
      <div class="taskbar-dot"></div>
      <img src="data:image/png;base64,{data['s32']}">
      <div class="taskbar-dot"></div>
    </div>
  </div>
  <div class="context-box">
    <h3>macOS Dock</h3>
    <div class="dock">
      <div class="dock-dot"></div>
      <img src="data:image/png;base64,{data['s128']}">
      <div class="dock-dot"></div>
      <div class="dock-dot"></div>
    </div>
  </div>
</div>
</body>
</html>"""

out = os.path.join(base, "icon-preview.html")
with open(out, "w", encoding="utf-8") as f:
    f.write(html)
print(f"Written to {out}")
