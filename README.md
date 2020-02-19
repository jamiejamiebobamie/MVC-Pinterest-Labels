# Pinterest Labels

This is a website built with **express**, **node.js**, **handlebars**, and **bootstrap** to apply labels to my Pinterest pins.

The site pulls pins from my Pinterest account using the **Pinterest API** and creates a 'Pin' document in a **Mongodb** database.
Users then cycle through the Pin documents by index (starting from 1 to however many pins are in the databse).

There are two methods for labeling the Pin documents: a **desktop** and a **mobile** method.
The mobile version of the site has preset buttons that users can push that will apply between 0 and 3 labels to a pin.
The desktop version allows users to enter their own labels on their keyboards.

Please check out the live site to help me label my pins and for further information regarding the project.
If you have any questions or comments regarding the project, please contact me at jmccrory@vt.edu.

## Built With

* Javascript ES5
* Node.js/Express.js
* Bootstrap and Handlebars
* Pinterest API
* CSS
* HTML

## Authors

* **Jamie McCrory**

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Note

This site was built in the span of a couple of weeks for a school intensive and does not always adhere to coding best practices.
