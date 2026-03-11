import os
import sys
from huggingface_hub import hf_hub_download

def download_model():
    repo_id = "google/gemma-2b-it"  
    source_repo = "mlabonne/gemma-2b-it-GGUF"
    source_filename = "gemma-2b-it.Q4_K_M.gguf"
    target_filename = "gemma-2b-it-q4_k_m.gguf"
    

    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_dir = os.path.join(current_dir, "models")
    
    os.makedirs(target_dir, exist_ok=True)
    
    target_path = os.path.join(target_dir, target_filename)
    
    if os.path.exists(target_path):
        print(f"Model file already exists at: {target_path}")
        return

    print(f"Downloading {source_filename} from {source_repo}...")
    try:
        download_path = hf_hub_download(
            repo_id=source_repo,
            filename=source_filename,
            local_dir=target_dir,
            local_dir_use_symlinks=False
        )
        
        if os.path.exists(download_path) and os.path.basename(download_path) != target_filename:
            final_path = os.path.join(target_dir, target_filename)
            if os.path.exists(final_path):
                os.remove(final_path)
            os.rename(download_path, final_path)
            print(f"Model downloaded and renamed to: {final_path}")
        else:
            print(f"Model downloaded to: {download_path}")
            
    except Exception as e:
        print(f"Error downloading model: {e}")
        sys.exit(1)

if __name__ == "__main__":
    download_model()
