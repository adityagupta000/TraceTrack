import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

def get_code_files(directory, excluded_files=None, excluded_dirs=None):
    """Fetch all project files except specified exclusions."""
    if excluded_files is None:
        excluded_files = {
            '__pycache__', 
            '.pyc', 
            '.pyo', 
            '.DS_Store',
            'Thumbs.db',
            'Desktop.ini',
            '.gitignore',
            '.env',
            'package-lock.json',  # Large auto-generated file
            '.git'
        }
    
    if excluded_dirs is None:
        excluded_dirs = {
            '__pycache__', 
            '.git', 
            'venv', 
            'env', 
            '.venv',
            'instance',
            '.pytest_cache',
            'logs',
            'migrations',
            'node_modules',  # Node.js dependencies
            'build',         # React build output
            'dist',          # Distribution files
            '.next',         # Next.js build
            'coverage'       # Test coverage
        }
    
    code_files = {}
    
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        
        # Skip if current directory is an excluded directory
        if any(excluded_dir in root.split(os.sep) for excluded_dir in excluded_dirs):
            continue
            
        for file in files:
            # Skip excluded files
            if file in excluded_files or file.endswith(('.pyc', '.pyo', '.log')):
                continue
                
            file_path = os.path.join(root, file)
            
            # Get file extension
            _, ext = os.path.splitext(file)
            
            try:
                # Try to read as text file first
                if ext.lower() in {'.py', '.html', '.css', '.js', '.jsx', '.ts', '.tsx', 
                                 '.sql', '.txt', '.md', '.json', '.xml', '.yaml', '.yml', 
                                 '.config', '.ini', '.jinja2', '.j2', '.template', 
                                 '.requirements', '.gitignore', '.env.example'}:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code_files[file_path] = f.readlines()
                elif file in {'requirements.txt', 'Dockerfile', 'Makefile', 'LICENSE', 
                             'README', 'package.json', 'tailwind.config.js', 
                             'postcss.config.js', 'hash.py'}:
                    # Handle files without extensions that are typically text
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code_files[file_path] = f.readlines()
                else:
                    # For binary files, just note them as binary
                    code_files[file_path] = [f"[Binary file - {ext} format]"]
                        
            except Exception as e:
                print(f"❌ Error reading {file_path}: {e}")
                code_files[file_path] = [f"[Error reading file: {str(e)}]"]
    
    return code_files


def create_pdf(code_data, output_pdf="Lost_and_Found_Frontend_Export.pdf"):
    c = canvas.Canvas(output_pdf, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    line_height = 10
    y = height - margin

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y, "🔍 Lost and Found Frontend Project Export")
    y -= 2 * line_height
    
    # Subtitle
    c.setFont("Helvetica", 12)
    c.drawString(margin, y, "React Frontend Application with Python Backend")
    y -= 2 * line_height
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "📁 Project File Structure:")
    y -= 2 * line_height

    file_paths = sorted(list(code_data.keys()))

    # 1. File list with project structure
    c.setFont("Courier", 8)
    for path in file_paths:
        if y < margin:
            c.showPage()
            c.setFont("Courier", 8)
            y = height - margin
        
        display_path = os.path.relpath(path)
        # Add proper indentation for project structure
        indent = "  " * (display_path.count(os.sep))
        file_name = os.path.basename(display_path)
        c.drawString(margin, y, f"{indent}📄 {file_name}")
        y -= line_height

    # Add page break before code content
    c.showPage()
    y = height - margin

    # 2. File contents
    for file_path in file_paths:
        lines = code_data[file_path]
        print(f"📄 Adding: {file_path}")

        if y < margin + 3 * line_height:
            c.showPage()
            y = height - margin

        # File header
        rel_path = os.path.relpath(file_path)
        c.setFont("Helvetica-Bold", 12)
        
        # Add file type emoji based on extension
        file_emoji = get_file_emoji(rel_path)
        c.drawString(margin, y, f"{file_emoji} File: {rel_path}")
        y -= line_height
        
        # Add separator line
        c.setFont("Courier", 8)
        c.drawString(margin, y, "=" * 80)
        y -= line_height

        # File content
        for line_num, line in enumerate(lines, 1):
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            
            # Clean and truncate line
            line = line.strip("\n").encode("latin-1", "replace").decode("latin-1")
            
            # Add line numbers for code files
            if rel_path.endswith(('.py', '.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.sql', '.json')):
                display_line = f"{line_num:3d}: {line[:280]}"
            else:
                display_line = line[:300]
            
            c.drawString(margin, y, display_line)
            y -= line_height

        # Add spacing between files
        y -= line_height
        if y > margin:
            c.setFont("Courier", 8)
            c.drawString(margin, y, "-" * 80)
            y -= 2 * line_height

    c.save()
    print(f"✅ PDF successfully created: {output_pdf}")
    print(f"📊 Total files processed: {len(code_data)}")


def get_file_emoji(file_path):
    """Return appropriate emoji based on file type."""
    ext = os.path.splitext(file_path)[1].lower()
    filename = os.path.basename(file_path).lower()
    
    if ext == '.py':
        return '🐍'
    elif ext in ['.html', '.htm']:
        return '🌐'
    elif ext in ['.css', '.scss', '.sass']:
        return '🎨'
    elif ext in ['.js', '.jsx']:
        return '⚡'
    elif ext in ['.ts', '.tsx']:
        return '🔷'
    elif ext == '.sql':
        return '🗃️'
    elif ext in ['.json', '.yaml', '.yml']:
        return '⚙️'
    elif ext in ['.txt', '.md']:
        return '📝'
    elif filename == 'package.json':
        return '📦'
    elif filename == 'requirements.txt':
        return '📦'
    elif 'dockerfile' in filename:
        return '🐳'
    elif filename in ['tailwind.config.js', 'postcss.config.js']:
        return '🔧'
    elif filename == 'hash.py':
        return '🔐'
    elif ext in ['.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg']:
        return '🖼️'
    else:
        return '📄'


def main():
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Look for lost-and-found-frontend directory or use current directory
    if os.path.exists(os.path.join(script_dir, 'lost-and-found-frontend')):
        root_dir = os.path.join(script_dir, 'lost-and-found-frontend')
    elif os.path.exists(os.path.join(script_dir, 'src')) and os.path.exists(os.path.join(script_dir, 'public')):
        # If we're already in the React project directory
        root_dir = script_dir
    else:
        root_dir = script_dir
    
    # Files to exclude
    excluded_files = {
        '.DS_Store',
        'Thumbs.db',
        'Desktop.ini',
        '.gitignore',
        '.env',
        '*.pyc',
        '*.pyo',
        '*.log',
        'package-lock.json',  # Large auto-generated file
        'favicon.ico',        # Binary files
        'logo192.png',
        'logo512.png',
        'logo.svg'
    }
    
    # Directories to exclude 
    excluded_dirs = {
        '__pycache__',
        '.git', 
        'venv',
        'env',
        '.venv',
        'instance',
        '.pytest_cache',
        'logs',
        'migrations',
        'node_modules',       # Node.js dependencies
        'build',              # React build output
        'dist',               # Distribution files
        '.next',              # Next.js build
        'coverage'            # Test coverage
    }
    
    print("🔍 Scanning Lost and Found frontend project files...")
    print(f"📁 Root directory: {root_dir}")
    
    code_files = get_code_files(root_dir, excluded_files, excluded_dirs)
    
    if not code_files:
        print("❌ No files found to process!")
        print("Make sure you're running this script in the correct directory.")
        return
    
    print(f"📁 Found {len(code_files)} files to include in PDF")
    
    # Display found files
    print("\n📋 Files to be included:")
    for file_path in sorted(code_files.keys()):
        rel_path = os.path.relpath(file_path)
        print(f"  - {rel_path}")
    
    create_pdf(code_files)
    
    print("\n🎉 PDF export completed!")
    print("📧 You can now share this PDF with others or submit it as documentation.")


if __name__ == "__main__":
    main()