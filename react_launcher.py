#!/usr/bin/env python3
"""
Voice Assistant React Launcher
Starts both backend API and React frontend
"""

import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def install_backend_dependencies():
    """Install Python backend dependencies"""
    print("📦 Installing backend dependencies...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "backend_requirements.txt"
        ])
        print("✅ Backend dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False

def install_frontend_dependencies():
    """Install Node.js frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    frontend_path = Path("frontend")
    
    if not frontend_path.exists():
        print("❌ Frontend directory not found!")
        return False
    
    try:
        subprocess.check_call(["npm", "install"], cwd=frontend_path)
        print("✅ Frontend dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        print("Make sure Node.js and npm are installed on your system")
        return False
    except FileNotFoundError:
        print("❌ npm not found. Please install Node.js first:")
        print("https://nodejs.org/")
        return False

def check_backend_dependencies():
    """Check if backend dependencies are available"""
    required = ['flask', 'flask_cors', 'requests']
    missing = []
    
    for package in required:
        try:
            __import__(package)
        except ImportError:
            missing.append(package)
    
    return len(missing) == 0, missing

def check_frontend_dependencies():
    """Check if frontend dependencies are available"""
    frontend_path = Path("frontend")
    node_modules = frontend_path / "node_modules"
    package_json = frontend_path / "package.json"
    
    return package_json.exists() and node_modules.exists()

def start_backend():
    """Start the Flask backend API"""
    print("🚀 Starting backend API server...")
    try:
        subprocess.Popen([
            sys.executable, "backend_api.py"
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("✅ Backend API started on http://localhost:5000")
        return True
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def start_frontend():
    """Start the React frontend"""
    print("🚀 Starting React frontend...")
    frontend_path = Path("frontend")
    
    try:
        subprocess.run(["npm", "run", "dev"], cwd=frontend_path)
    except KeyboardInterrupt:
        print("\n👋 Frontend stopped by user")
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")

def main():
    """Main launcher function"""
    print("🤖 Voice Assistant React Launcher")
    print("=" * 50)
    print("Configured for Hyderabad, India")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("config.py").exists():
        print("❌ Please run this script from the project root directory")
        print("Make sure you're in the FOURTH-PROJECT folder")
        return
    
    # Check backend dependencies
    backend_ok, missing_backend = check_backend_dependencies()
    if not backend_ok:
        print(f"⚠️  Missing backend dependencies: {', '.join(missing_backend)}")
        print("Installing backend dependencies...")
        if not install_backend_dependencies():
            print("❌ Cannot continue without backend dependencies")
            return
    
    # Check frontend dependencies
    if not check_frontend_dependencies():
        print("⚠️  Frontend dependencies not found")
        print("Installing frontend dependencies...")
        if not install_frontend_dependencies():
            print("❌ Cannot continue without frontend dependencies")
            return
    
    print("\n✅ All dependencies are ready!")
    print("\n🎯 Starting Voice Assistant...")
    print("📡 Backend API: http://localhost:5000")
    print("🌐 Frontend UI: http://localhost:5173")
    print("\n" + "=" * 50)
    print("INSTRUCTIONS:")
    print("1. Backend will start first")
    print("2. Frontend will open in your browser")
    print("3. Use the web interface to interact with the assistant")
    print("4. Press Ctrl+C to stop")
    print("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    print("\n⏳ Waiting for backend to start...")
    time.sleep(3)
    
    # Start frontend (this will block)
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
        sys.exit(0)
