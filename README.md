# jsxtreme-markdown

🚧 🚧 **EXPERIMENTAL! WORK IN PROGRESS!** 🚧 🚧

Transform Markdown with interpolated JS expressions and JSX elements into JSX or React component modules.

It's Xtreme! Like xtreme sports with Red Bull, but with Markdown and React and indoors at your computer.

## jsxtreme-markdown features

- You can interpolate JS expression and JSX elements between designated delimiters.
- The end goal is to produce JSX and React components.
- Because the Markdown is processed through [remark] and [rehype], you can include any plugins for either of those tools.

Within jsxtreme-markdown, JS expressions and JSX elements can be interpolated between designated delimiters (defaults are `{{..}}`).
JS expressions are transformed into curly-brace-delimited `{expressions}` within the JSX output.
JSX elements are passed directly through.

With the following input:

```markdown
# Title

Here is some **markdown**. *So easy* to write.

You can interpolate JS expressions like {{ data.number }}
or {{ dogs.map(d => d.name).join(', ') }}.

You can also interpolate JSX elements,
whether {{ <span>inline</span> }} or as a block:

{{ <div className="fancy-class">
  This is a block.
</div> }}

You can even break up JSX interpolation to process more or your text
as Markdown.

{{ <div className="fancy-class"}> }}
  This is a **Markdown** paragraph inside the div.

  And this is another.
{{ </div> }}
```

You get the following JSX output:

```js
<div>
  <h1>Title</h1>
  <p>Here is some <strong>markdown</strong>. So <em>easy</em> to write.</p>
  <p>
    You can interpolate JS expressions like {data.number}
    or {dogs.map(d => d.name).join(", ")}.
  </p>
  <p>
    You can also interpolate JSX elements,
    whether <span>inline</span> or as a block:
  </p>
  <div className="fancy-class">
    This is a block.
  </div>
  <p>
    You can even break up JSX interpolation to process more or your text
    as Markdown.
  </p>
  <div className="fancy-class">
    <p>This is a <strong>Markdown</strong> paragraph inside the div.</p>
    <p>And this is another.</p>
  </div>
</div>
```

This monorepo includes a few packages that allow you to use the jsxtreme-markdown syntax in a variety of ways:

- [jsxtreme-markdown] includes the core, low-level transform functions to convert Markdown to JSX strings or complete React component modules.
  These functions can be used to build higher-level modules that target specific contexts (Webpack loaders, Browserify transforms, gulp plugins, etc.).
- [jsxtreme-markdown-loader] is a Webpack loader build on top of [jxtreme-markdown].
  Given an input Markdown file, it outputs a React component module.
- [babel-plugin-transform-jsxtreme-markdown] is a Babel plugin that allows you to tag template literals of jsxtreme-markdown so they'll be transformed *at compile time* (and you don't have to include a Markdown parser in the browser bundle).

[jsxtreme-markdown]: https://github.com/mapbox/jsxtreme-markdown/tree/master/packages/jsxtreme-markdown#readme
[jsxtreme-markdown-loader]: https://github.com/mapbox/jsxtreme-markdown/tree/master/packages/jsxtreme-markdown-loader#readme
[babel-plugin-transform-jsxtreme-markdown]: https://github.com/mapbox/jsxtreme-markdown/tree/master/packages/babel-plugin-transform-jsxtreme-markdown#readme
[remark]: https://github.com/wooorm/remark
[rehype]: https://github.com/wooorm/rehype
