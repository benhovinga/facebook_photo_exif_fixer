import sys

from bs4 import BeautifulSoup


# Testing with args ["\\\\10.137.1.11\\home\\backups\\Facebook Archive\\posts\\album\\0.html"]
def main(args):
    if len(args) < 1:
        sys.exit("Missing file path as argument")

    # Open the HTML file and parse
    file_path = args[0]
    print(f"Opening HTML file '{file_path}'")
    with open(file_path, "r") as fs:
        soup = BeautifulSoup(fs, "html.parser")

    # Extract the page title (usually album name)
    page_title = soup.title.string if soup.title else ""
    print(f"Opened HTML file with title '{page_title}'")

    # Get the main element containing the photos
    main = soup.find(role="main")
    if main == None:
        sys.exit(
            "Cannot locate HTML tag with attribute \"role='main'\". Unable to continue."
        )


if __name__ == "__main__":
    main(sys.argv[1:])
