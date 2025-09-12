import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas

def get_code_files(directory, excluded_files=None, excluded_dirs=None):
    """Fetch all project files except specified exclusions."""
    if excluded_files is None:
        excluded_files = {
            'package.json', 
            'package-lock.json',
            'yarn.lock',
            'README.md',
            '.DS_Store',
            'Thumbs.db',
            'Desktop.ini',
            'favicon.ico',
            'logo192.png',
            'logo512.png',
            'manifest.json',
            'robots.txt'
        }
    
    if excluded_dirs is None:
        excluded_dirs = {
            'node_modules', 
            '.git', 
            '__pycache__', 
            'build', 
            '.next', 
            'dist',
            'coverage',
            '.nyc_output',
            'logs',
            'uploads',  # Exclude the uploads directory with images
            'venv',     # Exclude Python virtual environment
            'env',      # Alternative venv name
            '.venv'     # Alternative venv name
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
            if file in excluded_files:
                continue
                
            file_path = os.path.join(root, file)
            
            # Get file extension
            _, ext = os.path.splitext(file)
            
            try:
                # Try to read as text file first
                if ext.lower() in {'.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.less', 
                                 '.html', '.htm', '.json', '.md', '.txt', '.xml', '.yaml', '.yml', 
                                 '.config', '.gitignore', '.env', '.py', '.sh', '.bat', '.cmd',
                                 '.svg', '.dockerfile', '.editorconfig', '.eslintrc', '.prettierrc',
                                 '.sql', '.toml', '.ini', '.conf'} or file.startswith('.'):
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code_files[file_path] = f.readlines()
                else:
                    # For binary files, just note them as binary
                    code_files[file_path] = [f"[Binary file - {ext} format]"]
                        
            except Exception as e:
                print(f"❌ Error reading {file_path}: {e}")
                code_files[file_path] = [f"[Error reading file: {str(e)}]"]
    
    return code_files


def create_pdf(code_data, output_pdf="Lost_and_Found_Code_Export.pdf"):
    c = canvas.Canvas(output_pdf, pagesize=A4)
    width, height = A4
    margin = 20 * mm
    line_height = 10
    y = height - margin

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(margin, y, "📱 Lost and Found Project Code Export")
    y -= 2 * line_height
    
    # Project description
    c.setFont("Helvetica", 10)
    c.drawString(margin, y, "Full-stack Lost and Found application with React frontend and Flask backend")
    y -= line_height
    
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "📁 Project File Structure:")
    y -= 2 * line_height

    file_paths = sorted(list(code_data.keys()))

    # 1. File list organized by category
    c.setFont("Courier", 8)
    
    # Group files by type/location
    frontend_files = [f for f in file_paths if '/src/' in f or f.endswith(('.js', '.jsx', '.css', '.html')) and '/backend/' not in f]
    backend_files = [f for f in file_paths if '/backend/' in f or f.endswith('.py')]
    config_files = [f for f in file_paths if any(f.endswith(ext) for ext in ['.json', '.js', '.config', '.sql', '.gitignore']) and f not in frontend_files and f not in backend_files]
    other_files = [f for f in file_paths if f not in frontend_files and f not in backend_files and f not in config_files]
    
    # Frontend files
    if frontend_files:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, "🎨 Frontend Files (React):")
        y -= line_height
        c.setFont("Courier", 8)
        for path in frontend_files:
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            display_path = os.path.relpath(path)
            c.drawString(margin + 10, y, f"- {display_path}")
            y -= line_height
        y -= line_height
    
    # Backend files
    if backend_files:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, "🔧 Backend Files (Flask/Python):")
        y -= line_height
        c.setFont("Courier", 8)
        for path in backend_files:
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            display_path = os.path.relpath(path)
            c.drawString(margin + 10, y, f"- {display_path}")
            y -= line_height
        y -= line_height
    
    # Configuration files
    if config_files:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, "⚙️ Configuration Files:")
        y -= line_height
        c.setFont("Courier", 8)
        for path in config_files:
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            display_path = os.path.relpath(path)
            c.drawString(margin + 10, y, f"- {display_path}")
            y -= line_height
        y -= line_height
    
    # Other files
    if other_files:
        c.setFont("Helvetica-Bold", 10)
        c.drawString(margin, y, "📄 Other Files:")
        y -= line_height
        c.setFont("Courier", 8)
        for path in other_files:
            if y < margin:
                c.showPage()
                c.setFont("Courier", 8)
                y = height - margin
            display_path = os.path.relpath(path)
            c.drawString(margin + 10, y, f"- {display_path}")
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
        
        # Add file type indicator
        if '/src/' in rel_path:
            file_icon = "⚛️"  # React
        elif rel_path.endswith('.py'):
            file_icon = "🐍"  # Python
        elif rel_path.endswith('.sql'):
            file_icon = "🗄️"  # Database
        elif rel_path.endswith(('.css', '.scss')):
            file_icon = "🎨"  # Styles
        elif rel_path.endswith(('.js', '.jsx', '.ts', '.tsx')):
            file_icon = "📜"  # JavaScript
        else:
            file_icon = "📄"  # General
            
        c.drawString(margin, y, f"{file_icon} File: {rel_path}")
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
            if any(rel_path.endswith(ext) for ext in ['.js', '.jsx', '.ts', '.tsx', '.css', '.py', '.html', '.json', '.sql']):
                display_line = f"{line_num:3d}: {line[:275]}"
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


def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Files to exclude (updated for Lost and Found project)
    excluded_files = {
        'package.json', 
        'package-lock.json',
        'yarn.lock',
        'README.md',
        '.DS_Store',
        'Thumbs.db',
        'Desktop.ini',
        'favicon.ico',
        'logo192.png',
        'logo512.png',
        'manifest.json',
        'robots.txt',
        'logo.svg'  # React default logo
    }
    
    # Directories to exclude (updated for Lost and Found project)
    excluded_dirs = {
        'node_modules',
        '.git', 
        '__pycache__',
        'build',
        'dist',
        '.next',
        'coverage',
        '.nyc_output',
        'logs',
        'uploads',  # Contains uploaded images
        'static/uploads',  # Flask static uploads directory
        'venv',     # Python virtual environment
        'env',      # Alternative venv name
        '.venv'     # Alternative venv name (hidden)
    }
    
    print("🔍 Scanning Lost and Found project files...")
    print("📱 Including React frontend and Flask backend code...")
    code_files = get_code_files(root_dir, excluded_files, excluded_dirs)
    
    if not code_files:
        print("❌ No files found to process!")
        return
    
    print(f"📁 Found {len(code_files)} files to include in PDF")
    
    # Show file breakdown
    frontend_count = len([f for f in code_files.keys() if '/src/' in f])
    backend_count = len([f for f in code_files.keys() if f.endswith('.py')])
    config_count = len([f for f in code_files.keys() if any(f.endswith(ext) for ext in ['.json', '.js', '.sql', '.gitignore']) and '/src/' not in f and not f.endswith('.py')])
    
    print(f"  ⚛️  Frontend files: {frontend_count}")
    print(f"  🐍 Backend files: {backend_count}")
    print(f"  ⚙️  Config files: {config_count}")
    print(f"  📄 Other files: {len(code_files) - frontend_count - backend_count - config_count}")
    
    create_pdf(code_files)


if __name__ == "__main__":
    main()