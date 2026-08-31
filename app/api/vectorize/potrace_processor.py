import sys
import os
import json
import subprocess
import tempfile
import re
try:
    import cv2
    import numpy as np
    from PIL import Image
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

def vectorize_potrace_color_layers(input_path, output_svg_path, output_png_path, options):
    if not HAS_OPENCV:
        raise Exception("OpenCV and Pillow are required.")

    # Parameters
    color_count = max(2, min(64, int(options.get('colorCount', options.get('color_precision', 16)))))
    min_shape_size = int(options.get('minShapeSize', options.get('filter_speckle', 50)))
    auto_remove_bg = options.get('auto_remove_bg', True)

    # 1. Load image
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise Exception(f"Could not read image from {input_path}")

    h_orig, w_orig = img.shape[:2]

    # Handle Alpha / Transparency
    if img.shape[2] == 4:
        b, g, r, a = cv2.split(img)
        _, alpha_mask = cv2.threshold(a, 128, 255, cv2.THRESH_BINARY)
        img_rgb = cv2.merge([r, g, b])
    else:
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        if auto_remove_bg:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            corners = [gray[0,0], gray[0, w_orig-1], gray[h_orig-1, 0], gray[h_orig-1, w_orig-1]]
            bg_val = int(np.median(corners))
            diff = cv2.absdiff(gray, bg_val)
            _, alpha_mask = cv2.threshold(diff, 20, 255, cv2.THRESH_BINARY)
        else:
            alpha_mask = np.ones((h_orig, w_orig), dtype=np.uint8) * 255

    # 2. Color Quantization (K-means clustering)
    # Exclude transparent pixels from clustering if alpha_mask is present
    fg_pixels = img_rgb[alpha_mask > 0]
    if len(fg_pixels) < 10:
        fg_pixels = img_rgb.reshape(-1, 3)

    pixels_float = np.float32(fg_pixels)
    k_clusters = min(color_count, len(fg_pixels))
    
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 100, 0.2)
    _, labels, centers = cv2.kmeans(pixels_float, k_clusters, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    centers = np.uint8(centers)

    # Map entire image pixels to closest center
    img_flat = img_rgb.reshape(-1, 3).astype(np.float32)
    distances = np.linalg.norm(img_flat[:, None, :] - centers[None, :, :], axis=2)
    closest_labels = np.argmin(distances, axis=1).reshape(h_orig, w_orig)

    # 3. For each dominant color center, create a binary mask and vectorize with Potrace
    potrace_available = False
    try:
        res = subprocess.run(["potrace", "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode == 0:
            potrace_available = True
    except FileNotFoundError:
        potrace_available = False

    all_paths = []
    total_paths = 0

    for color_idx, color in enumerate(centers):
        # Create binary mask for this color
        mask = np.zeros((h_orig, w_orig), dtype=np.uint8)
        color_pixels = (closest_labels == color_idx) & (alpha_mask > 0)
        mask[color_pixels] = 255

        # Skip color if mask is empty or negligible (< 5 pixels)
        if np.count_nonzero(mask) < 5:
            continue

        # Smooth edges with light Gaussian blur + thresholding
        mask = cv2.GaussianBlur(mask, (3, 3), 0)
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)

        color_hex = '#{:02x}{:02x}{:02x}'.format(int(color[0]), int(color[1]), int(color[2]))

        if potrace_available:
            # Save temporary mask image (BMP format for Potrace)
            with tempfile.NamedTemporaryFile(suffix='.bmp', delete=False) as tmp_bmp:
                cv2.imwrite(tmp_bmp.name, mask)
                tmp_bmp_path = tmp_bmp.name

            svg_path = tmp_bmp_path.replace('.bmp', '.svg')

            try:
                cmd = [
                    'potrace',
                    '--svg',
                    '--opttolerance', '0.2',
                    '--alphamax', '1.0',
                    '--turdsize', str(min_shape_size),
                    '-o', svg_path,
                    tmp_bmp_path
                ]
                subprocess.run(cmd, check=True)

                with open(svg_path, 'r', encoding='utf-8') as f:
                    svg_content = f.read()

                # Extract path d attributes from SVG
                paths = re.findall(r'<path[^>]*d="([^"]*)"', svg_content)
                for d in paths:
                    all_paths.append(f'  <path d="{d}" fill="{color_hex}" />')
                    total_paths += 1
            finally:
                if os.path.exists(tmp_bmp_path): os.unlink(tmp_bmp_path)
                if os.path.exists(svg_path): os.unlink(svg_path)
        else:
            # Fallback OpenCV Bézier approximation if potrace binary is missing
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_TC89_KCOS)
            d_list = []
            for cnt in contours:
                if cv2.contourArea(cnt) >= min_shape_size:
                    approx = cv2.approxPolyDP(cnt, 0.005 * cv2.arcLength(cnt, True), True)
                    if len(approx) > 2:
                        pts = approx.reshape(-1, 2)
                        d = f"M {pts[0][0]} {pts[0][1]} "
                        for pt in pts[1:]:
                            d += f"L {pt[0]} {pt[1]} "
                        d += "Z"
                        d_list.append(d)
                        total_paths += 1
            if d_list:
                merged_d = " ".join(d_list)
                all_paths.append(f'  <path d="{merged_d}" fill="{color_hex}" />')

    # 4. Combine all SVG layers into one clean SVG
    final_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w_orig} {h_orig}" width="{w_orig}" height="{h_orig}">
<!-- Vectorized by VXEL Potrace Engine -->
''' + '\n'.join(all_paths) + '\n</svg>'

    with open(output_svg_path, 'w', encoding='utf-8') as f:
        f.write(final_svg)

    # Save PNG transparent preview
    quantized_img = centers[closest_labels]
    bgr_quantized = cv2.cvtColor(quantized_img, cv2.COLOR_RGB2BGR)
    png_result = cv2.merge([bgr_quantized[:,:,0], bgr_quantized[:,:,1], bgr_quantized[:,:,2], alpha_mask])
    cv2.imwrite(output_png_path, png_result)

    return {
        'total_paths': max(1, total_paths),
        'colors_count': len(centers),
        'width': w_orig,
        'height': h_orig,
    }

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage: python potrace_processor.py <input_img> <output_svg> <output_png> [options_json]")
        sys.exit(1)

    input_img = sys.argv[1]
    output_svg = sys.argv[2]
    output_png = sys.argv[3]
    options_arg = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}

    res = vectorize_potrace_color_layers(input_img, output_svg, output_png, options_arg)
    print(json.dumps(res))
