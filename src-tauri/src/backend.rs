use llama_cpp_2::llama_backend::LlamaBackend;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct SharedBackendInner {
    backend: Option<Arc<LlamaBackend>>,
}

impl SharedBackendInner {
    pub fn ensure(&mut self) -> Result<Arc<LlamaBackend>, String> {
        if let Some(ref b) = self.backend {
            return Ok(b.clone());
        }
        let b = LlamaBackend::init()
            .map_err(|e| format!("Failed to init llama backend: {:?}", e))?;
        let b = Arc::new(b);
        self.backend = Some(b.clone());
        Ok(b)
    }
}

pub type SharedBackend = Arc<Mutex<SharedBackendInner>>;

pub fn create_shared_backend() -> SharedBackend {
    Arc::new(Mutex::new(SharedBackendInner { backend: None }))
}
