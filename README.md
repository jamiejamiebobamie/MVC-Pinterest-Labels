This is a website built with express and node.js to apply labels to my Pinterest pins.

The site pulls pins from my Pinterest account using the Pinterest API and creates a 'Pin' document in a mongodb database.
Users then cycle through the Pin documents by index (starting from 1 to however many pins are in the databse).

There are two methods for labeling the Pin documents: a desktop and a mobile method.
The mobile version of the site has preset buttons that users can push that will apply between 0 and 3 labels to a pin.
The desktop version allows users to enter their own labels on their keyboards.

This site was built in the span of a couple of weeks for a school intensive and does not always adhere to coding best practices.

Please check out the live site to help me label my pins and for further information regarding the project.

TO-DO:
Format and fully document controllers/pin.js
Format public/styles/styles.css. Styles should be grouped by view and have docstrings.
Format all views for indentation.
