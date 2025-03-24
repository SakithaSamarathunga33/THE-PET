@echo off
echo Installing root dependencies...
npm install

echo Installing server dependencies...
cd server
npm install

echo Setting up Python virtual environment...
python -m venv venv
CALL venv\Scripts\activate.bat
pip install prophet
pip install pandas
pip install numpy
pip install pymongo

echo Installing frontend dependencies...
cd ../site
npm install

echo Setup complete! To start the application, run: npm start
cd .. 