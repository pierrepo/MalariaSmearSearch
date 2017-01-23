from flask import Flask
import config

app = Flask(__name__)
app.config.from_object('config.DevelopmentConfig')


@app.route("/")
def main():
    """
    Define the basic route / and its corresponding request handler
    """
    return "Welcome!"



if __name__ == "__main__":
    # Run the app if the executed file is the main program
    app.run()
