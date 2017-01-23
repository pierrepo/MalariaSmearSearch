from flask import Flask
app = Flask(__name__)

@app.route("/")
def main():
    """
    Define the basic route / and its corresponding request handler
    """
    return "Welcome!"




if __name__ == "__main__":
    # Run the app if the executed file is the main program
    app.run()
