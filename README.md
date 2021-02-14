# grid-lines

Interactive canvas animation of lines moving on a grid next to the user cursor.

<img width="100%" src="./.github/demo.gif">



## Config

```js
const config = {
	backgroundColor: "white",
	gridColor: "grey",
	linesColor: ["blue", "#FF5733", "#581845"],
	speed: 10,
	lineLength: 110,
};

const canvas = document.querySelector("canvas");
new GridLines(canvas, config);
```


<br><br>

> Original idea from Robert Coopercode - [Animated Grid Line](https://github.com/robertcoopercode/animated-grid-lines)