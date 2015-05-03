# wm-yom-parse.js
is a translator from the human-readable hierarchical data presentation into `javascript object`.  
The data are presented in a `YOM` format, which is some extension of `CSV` for tree-like structures.  
   
Example (some imaginary application) :  
```
File [New, Open, Save, Remove],
View [
    Text [ANSI {default}, UTF-8],
    Binary, HTML],
Help [On-line, Forum, About]
```

Result:
```
{
    "label": "",
    "nodes": [
        {
            "label": "File",
            "nodes": [
                {
                    "label": "New",

// ... and many more rows; too much to give full content ...

                {
                    "label": "About",
                    "nodes": []
                }
            ]
        }
    ]
}
```


## When to use it

One most likely may use it when:
* Data are of the hierarchical nature  

and
* Data are entirely separated from their markup


## How to use it

```
<script src="wm-yom-parse.js"> </script>
<script>
    var jsObj =                         // the result is common js object
      window.wmYomParse (source_data);  // the source is some text in YOM
</script>
```

## Examples
* To be done, soon

## Much more details
are [here](http://al-scvorets.github.io/wm-yom-parse.js/)

## License
[MIT License](http://opensource.org/licenses/MIT)
