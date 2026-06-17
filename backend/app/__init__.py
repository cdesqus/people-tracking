"""
CCTV Face Recognition Dashboard Backend Application
"""

__version__ = "1.0.0"
__author__ = "Development Team"

# Monkey patch torch.load to bypass weights_only=True in PyTorch 2.6+ for loading YOLO models safely
try:
    import torch
    _original_torch_load = torch.load
    def _patched_torch_load(*args, **kwargs):
        # Force weights_only=False to allow loading YOLO architecture models
        kwargs['weights_only'] = False
        return _original_torch_load(*args, **kwargs)
    torch.load = _patched_torch_load
except Exception:
    pass

