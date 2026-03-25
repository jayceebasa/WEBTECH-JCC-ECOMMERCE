#!/usr/bin/env python3
import shutil
import os

base = r'C:\Users\JAYCEE\Documents\GitHub\WEBTECH-JCC-ECOMMERCE'
backend = os.path.join(base, 'backend')
api = os.path.join(base, 'api')

# Define directories to copy
dirs_to_copy = ['config', 'controllers', 'models', 'middleware', 'routes']

for dir_name in dirs_to_copy:
    src_dir = os.path.join(backend, dir_name)
    dst_dir = os.path.join(api, dir_name)
    
    print(f'Copying from {src_dir} to {dst_dir}')
    
    # Verify destination exists
    if not os.path.exists(dst_dir):
        print(f'Creating directory: {dst_dir}')
        os.makedirs(dst_dir)
    else:
        print(f'Directory exists: {dst_dir}')
    
    for file in os.listdir(src_dir):
        if file.endswith('.js'):
            src_file = os.path.join(src_dir, file)
            dst_file = os.path.join(dst_dir, file)
            try:
                shutil.copy2(src_file, dst_file)
                print(f'✓ Copied {file}')
            except Exception as e:
                print(f'✗ Error copying {file}: {e}')

print('\nAll backend files copied successfully!')
