#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "Checking for Python installation..."

# Check if python or python3 is available on the path
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
    echo -e "${GREEN}Found Python 3 at $(which python3)${NC}"
elif command -v python &>/dev/null; then
    # Check if 'python' is actually Python 3
    PYTHON_VERSION=$(python --version 2>&1 | awk '{print $2}' | cut -d. -f1)
    if [ "$PYTHON_VERSION" -eq 3 ]; then
        PYTHON_CMD="python"
        echo -e "${GREEN}Found Python 3 at $(which python)${NC}"
    else
        echo -e "${RED}Python command exists but is not Python 3.${NC}"
        echo -e "${RED}Please install Python 3 and try again.${NC}"
        exit 1
    fi
else
    echo -e "${RED}Python not found on your PATH.${NC}"
    echo -e "${RED}Please install Python 3 and try again.${NC}"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
echo -e "${GREEN}Python version: $PYTHON_VERSION${NC}"

# Create virtual environment
VENV_NAME=".venv"
echo "Creating virtual environment named '$VENV_NAME'..."

if [ -d "$VENV_NAME" ]; then
    echo -e "${YELLOW}Virtual environment directory already exists.${NC}"
    read -p "Do you want to remove it and create a new one? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Removing existing virtual environment..."
        rm -rf "$VENV_NAME"
    else
        echo -e "${YELLOW}Using existing virtual environment.${NC}"
    fi
fi

if [ ! -d "$VENV_NAME" ]; then
    $PYTHON_CMD -m venv "$VENV_NAME"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to create virtual environment.${NC}"
        echo -e "${RED}Make sure the 'venv' module is available.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Virtual environment created successfully.${NC}"
fi

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo -e "${YELLOW}Warning: requirements.txt not found.${NC}"
    read -p "Do you want to continue without installing requirements? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting."
        exit 0
    fi
fi

# Activate virtual environment and install requirements
echo "Installing requirements from requirements.txt..."

# Different activation methods depending on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source "$VENV_NAME/Scripts/activate"
else
    # Unix-based systems
    source "$VENV_NAME/bin/activate"
fi

if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install requirements.${NC}"
        echo -e "${RED}Check requirements.txt for errors.${NC}"
        deactivate
        exit 1
    fi
    echo -e "${GREEN}Requirements installed successfully.${NC}"
else
    echo -e "${YELLOW}Skipping requirements installation.${NC}"
fi

# Check if streamlit is installed in the virtual environment
if ! pip list | grep -q streamlit; then
    echo -e "${YELLOW}Streamlit not found in virtual environment.${NC}"
    echo "Installing streamlit..."
    pip install streamlit
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install streamlit.${NC}"
        deactivate
        exit 1
    fi
    echo -e "${GREEN}Streamlit installed successfully.${NC}"
fi

echo -e "${GREEN}Starting streamlit application...${NC}"
# Run streamlit from the virtual environment
python -m streamlit run backend/streamlit-audio-recorder.py

# Deactivate virtual environment
#deactivate

echo -e "${GREEN}Setup completed successfully!${NC}"
echo "To activate the virtual environment, run:"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    echo "  source $VENV_NAME/Scripts/activate"
else
    echo "  source $VENV_NAME/bin/activate"
fi

