from huggingface_hub import hf_hub_download

file_path = hf_hub_download(
    repo_id="TheBloke/Mistral-7B-OpenOrca-GGUF",
    filename="mistral-7b-openorca.Q4_0.gguf"
)

print("Téléchargé dans :", file_path)
