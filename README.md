# Media Storyboard Node Diagram Prototype

I created this prototype using React Flow as a proof of concept. I intend to integrate it as a
component in a larger media storyboard project. This is why group nodes are called "scene lists"
and smaller nodes are called "frames". The idea is for a media scene to be a group of frames
that typically run one after the other (represented as a horizontal list). However, edges will
connect frames together when there are choices to be made by the user and it will then jump
to a different scene. It can be like a choose-your-own-adventure game.

It was a challenge to make the frame nodes automatically align in a horizontal list after drag-and-dropping
(DnD) the nodes onto a scene list, especially when positioning them before other frame nodes in a
sequence. React Flow was built to position nodes in absolute positions. Normally, nodes do not
automatically align themselves, but React Flow works with other
[layouts](https://reactflow.dev/examples/layout/horizontal) to do other kinds of alignment,
but those don't work the way I want.

Before this project, I created two other projects that didn't work out.
Both of them had an HTML horizontal scrolling overflow lists. I wanted to be able to set the maximum
width of the scene lists and allow the user to just scroll through the list. It didn't work out
because the positioning of handles and edges by React Flow always got weird when I used that kind of
layout and style. When I tried to connect nodes together with edges, it would connect to the
wrong node and there was no way to fix it (bangs head on keyboard). So, with this project, I just
expand the scene list when more frames are added.

### Example using stills from the movie The Birds (1963)
[![Storyboard scenes node diagram of movie The Birds](storyboard_thebirds.png)](https://vintillect.com/storyboard/)


## Commands that helped me started to create it:

React Flow has a helpful [Vite React Flow Template](https://reactflow.dev/learn) to install and get started.

```bash
npx degit xyflow/vite-react-flow-template your-app-name
```

Instead of relying upon React's built in state manager and Redux, I decided to use
[Redux Toolkit](https://redux-toolkit.js.org/) which has [Immer built in](https://redux-toolkit.js.org/usage/immer-reducers).
This allowed me to make my reducers much more simplified as it appears that it mutates the state. Yes!

In my opinion, "reducer" is a horrible, misleading name for these kinds of functions. They don't reduce anything.

```bash
npm install @reduxjs/toolkit
```


## React Flow Groups / Sub Flows

The **other challenge** that I had with this project was implementing dynamic grouping. I can DnD a frame node
from one scene list (group) to another. The problem is that
[dynamic grouping](https://reactflow.dev/examples/nodes/dynamic-grouping) requires a
React Flow Pro Plan and I'm not quite ready for that yet.
So, I implemented my own way of dynamically grouping them. I fully intend to support them in the
future for their awesome work.
