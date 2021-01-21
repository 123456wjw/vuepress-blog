
## 一、函数式组件

1.函数组件
    在hooks出现之前，react中的函数组件通常只考虑负责UI的渲染，没有自身的状态没有业务逻辑代码，是一个纯函数。下面这个函数组件就是一个纯函数，它的输出只由参数props决定，不受其他任何因素影响。

```js
function Child(props) {
  const { x, y } = props.mouse
  return (
    <div style={{ height: '100%' }}>
      <h1>The mouse position is ({x}, {y})</h1>
    </div>
  ) 
}
```

    但是这种函数组件一旦我们需要给组件加状态，那就只能将组件重写为类组件，因为函数组件没有实例，没有生命周期。所以我们说在hook之前的函数组件和类组件最大的区别又是**状态**的有无。

---
2.hooks
    hooks为函数组件提供了状态，也支持在函数组件中进行数据获取、订阅事件解绑事件等等。下面先介绍几个最基本的hook作为基础知识。

    1）useState，通过useState为组件提供状态。这是一个简单的useState例子，<a href="https://codesandbox.io/s/jolly-frost-s8jcu" target="_blank">计数器</a>，useState的参数是state的初始值，他只有在组件第一次渲染的时候会生效，他的返回值是一个数组，第一个是state，第二个是设置state的函数。

    2）useEffect，副作用。通常在副作用中进行ajax请求，事件的绑定与解绑，设置定时器与清除等等。这是一个简单的useEffect的例子，<a href="https://codesandbox.io/s/useeffectjiandanlizi-r848w" target="_blank">useEffect基本用法</a>，useEffect第一个参数是一个回调函数，在里面进行业务逻辑代码的书写；第二个参数是依赖项数组，如果数组中的依赖发生变化，那么该副作用就会重新执行，如果不设置第二个参数，那么当该组件每渲染一次，副作用就会执行一次；当然如果设置空数组，那么该副作用只会在组件初次渲染时执行一次。

    注意，有时我们会需要清除副作用，例如，<a href="https://codesandbox.io/s/boring-dew-s7kok" target="_blank">定时器</a>，useEffect的回调函数接受一个返回值，这个返回值是一个函数，在这个函数中我们可以执行清除副作用操作，上例中，如果不清除定时器，那么副作用每执行一次，就会产生一个新的定时器，造成内存溢出。

    3）useCallback，用于缓存函数，第一个参数为要缓存的函数，第二个参数为依赖项数组，如果依赖发生了变化，那么就会生成一个新的函数；否则当组件重新渲染时，不会重新定义这个函数，而是会取缓存。

    4）useMemo，用于缓存函数的返回值，第一个参数为要缓存的函数（注意实际被缓存的是函数被执行过后的值），第二个参数为依赖项数组，如果依赖发生了变化，那么就会重新执行这个函数，得到新的返回值；否则当组件重新渲染时，不会重新执行这个函数，而是直接取被缓存的该函数的返回值。

    useCallback，useMemo都是用作优化函数式组件性能的，这里不做过多讲解。

## 二、函数式组件与类组件的区别

    首先，需要明确的一点是，虽然函数组件和类组件的优化策略不太相同，但是在优化得当的情况下，性能的差异在现代浏览器中是很小的。性能主要取决于代码，而不是选择函数组件和类组件本身的差异上，所以不用从性能角度考虑该选择哪种方式写代码。

    下面要讲的是函数式组件与类组件的一些区别，

    1）状态同步问题，**函数组件会捕获当前渲染时所用的值**。但往往这被忽略了。

    先来看下这个例子，<a href="https://codesandbox.io/s/fragrant-shape-vneoc" target="_blank">状态同步</a>，按照下面步骤进行操作：

```List
1.先输入111
2.点击按钮
3.再输入222
```

    通过这个操作，我们可以发现，不管是props还是自身的state，函数式组件中弹出的值都是点击按钮那一刻的值，而类组件都是最新的值。

    现在我们来分析一下出现这种差异性的原因。

    首先我们知道，不论是函数式组件还是类组件，只要状态或者props发生变化了那就会重新渲染，而且对于没有进行过性能优化的子组件来说，只要父组件重新渲染了，子组件就会重新渲染。而且在react中**props是不可变的，而this是一直在改变的**。所以类组件中的方法可以获取到最新的实例即this，而函数组件在渲染的时候因为**闭包**的原因捕获了渲染时的值，所以改例子会出现这种现象。

    那我们如何让类组件获取渲染时的值或者让函数组件获取最新值呢，看下面这个例子，<a href="https://codesandbox.io/s/eloquent-glitter-zh900" target="_blank">类组件利用闭包，函数组件利用useRef</a>，对于类组件我们将函数定义在render函数当中，这样我们就形成了一个闭包，就可以像函数组件一样在渲染的时候捕获相应的值；而对于函数组件我们通过useRef来实现获取最新的值，因为**useRef的返回值也是可变的**。

    再来看一个关于状态同步的问题，<a href="https://codesandbox.io/s/sparkling-morning-tkph5" target="_blank">函数组件与类组件定时器</a>，我们发现两个组件实现的效果是一致的。但是我们仔细看一下函数组件，我们在useEffect中创建了一个定时器，但是每当count值改变，组件重新渲染这时就会把这个定时器清除，并且重新创建一个定时器，这很明显不是我们想要的。但是如果把count依赖去掉，会发现count值永远停留在了1。造成这个原因也是个上面讲的函数组件在渲染时捕获了所用的值，useEffect中的定时器在渲染时捕获到的count值为0，所以count值永远是从0变到1。

    这就是讲的第一个差异，即**状态的同步**问题。

    2）函数组件useEffect与类组件生命周期

    先介绍几个类组件中的生命周期函数：

    组件首次挂载完成：componentDidMount() {}、组件是否需要更新：shouldComponentUpdate() {}、组件更新完成：componentDidUpdate() {}
组件将要卸载：componentWillUnmount() {}。通常在componentDidMount中我们会进行一些依赖于DOM的初始化，进行网络请求，事件绑定，订阅等等；在componentDidUpdate进行一些DOM操作和网络请求；在componentWillUnmount会进行一些事件解绑和取消订阅的操作。

    对比函数组件，这些操作我们都可以通过useEffect这个hook来实现，但是useEffect管理起来要比类组件中生命周期更加繁琐，尤其是在业务逻辑复杂的情况下。

    首先，当我们在执行useEffect时，为了避免每次 render 都去执行它的 callback，我们通常会传入第二个参数依赖数组。这样，只有当依赖数组发生变化时，才会执行 useEffect 的回调函数。但是当业务逻辑复杂，可能就会导致以来过多的问题。所以可能在项目中会出现下面这样的代码：

```js
useEffect(() => {
  // ...
}, [name, searchState, address, status, personA, personB, progress, page, size]);
```

    如果一个组件中有多处这样的代码，那光是维护这些依赖就已经比较复杂，就不用说里面的业务逻辑了。由此引发几个思考：

- 1.该使用多个state还是单个state？
- 2.如何减少依赖项？

    第一个问题，因为通过useState定义的state常常会成为依赖项注入依赖数组，如果把所有state分开，那么势必会造成依赖过多的问题。但是如果定义单个state，就像类组件中的this.state一样，那么就会造成所有的业务逻辑都在一个useEffect中，不利于代码的维护和通过useEffect的拆分来实现业务逻辑的分离。所以结合实际情况，可以把同一类的状态定义在一起，如下：

```js
//分页属性可以归类为同一类
const [pagination, setPagination] = useState({current: 1, pageSize: 10})
//位置属性也可以归类为同一类
const [position, setPosition] = useState({left: 0, top: 0})
```

    对于减少依赖项我们通常有一下几种做法：

- 将 Hook 拆分为更小的单元，每个 Hook 依赖于各自的依赖数组。
- 通过合并相关的 state，将多个依赖值聚合为一个。
- 通过 setState 回调函数获取最新的 state，以减少外部依赖，参考这个<a href="https://codesandbox.io/s/condescending-sara-gu1y3" target="_blank">定时器</a>例子。
- 通过useReducer将更新与动作解耦。上个方法的缺陷在于如果依赖了两个state那么我们又得添加依赖项，观察以下代码

```js
useEffect(() => {
  const id = setInterval(() => {
    setCount(c => c + step);
  }, 1000);
  return () => clearInterval(id);
}, [step]);
```

我们发现，这里的step仍然无法省略，解决办法就是通过**useReducer**来实现**更新与动作解耦**，看这个例子，<a href="https://codesandbox.io/s/blissful-snow-sjq68" target="_blank">useReducer实现更新与动作解耦</a>，在代码中我们可以看出在useEffect中的更新操作只依赖了dispatch这一个函数，并且这个函数是永远不会变得，所以这里不需要任何依赖。

    针对依赖数组的维护，我们在下面性能优化中还会继续提到。**由上可见，当组件，业务逻辑很复杂的时候，响应式的useEffect是很麻烦去管理的。而类组件会减少我们在管理上的压力。**

    3）性能优化

    类组件shouldComponentUpdate这个生命周期，通常我们在这个生命周期中进行组件的优化，通过判断前一个props和当前的props是否有变化来判断组件是否需要渲染，或者通过PureComponent实现；

    那么在函数组件中我们通过React.memo()来实现，具体看下面这个例子，<a href="https://codesandbox.io/s/amazing-hermann-4287x" target="_blank">React.memo()</a>，点击增加count按钮，观察console，发现只打印了“NotUseMemoComponent ”，这就说明当父组件传递给子组件的值没有发生改变的情况下，使用了memo包裹的子组件不会因为父组件重新渲染而重新渲染，而没有使用memo包裹的组件只要父组件渲染了，子组件也会渲染。

    但是当父组件将自己定义的引用类型的值传递给子组件时，即使值没有改变。但是由于每次渲染的时候都会生成新的变量，导致引用发生了改变，所以子组件仍然会渲染，具体看这个例子，<a href="https://codesandbox.io/s/dazzling-sky-vp8eu" target="_blank">传递函数对象或者数组</a>，由打印可知，每次父组件重渲染都会生成新的sayHi函数，这就使得子组件重渲染并且由于useEffect依赖了这个函数，useEffect也重新执行。这就会导致子组件做了很多无用的渲染。

    针对上面这个现象，通常考虑使用useCallback，useMemo来实现优化，看下面这个例子，<a href="https://codesandbox.io/s/usecallbackusememoyouhua-zzgxp" target="_blank">useCallback,useMemo</a>，现在我们发现即使我们不停的点击按钮，也不会重新触发子组件的渲染，并且useEffect也不会执行。这是因为useCallback，useMemo在依赖数组没变的情况下，都读取了缓存，没有重新生成函数或者对象。

    注意，用useState定义的状态和改变状态的方法如果成为了依赖，不会因为重渲染而导致回调函数被重新执行，因此不需要用useCallback或useMemo包裹。

    4）代码复用

    假设现在有A、B、C、D四个组件，B和D为UI不同但是业务逻辑类似的组件，都是从服务端获取数据后循环展示列表数据，结构大致如下

```xml
<A>
 <B />
</A>

<C>
 <D />
</C>
```

    函数组件：**自定义hook**

    原本我们需要在B和D组件中都进行状态的定义和数据的获取，B和D组件如下：

```js
// 组件B/D：
import React, {useState, useEffect} from 'react'
import axios from 'axios'
function B() {
	const [lists, setLists] = useState([])
	useEffect(() => {
		const getLists = async () => {
			const data = await axios.get('xxx/xxxx') //数据请求地址
			setLists(data)
		}
		getLists()
	}, [])
	return(
		//渲染
		<>
			{lists.map(item) => ()}
		</>
	)
}
export default B
```

    现在可以自定义一个hook，将同样的代码只写一次，如下：

```js
// useAxios.js：
import {useState, useEffect} from 'react'
import axios from 'axios'
function useAxios(name) {
	const [lists, setLists] = useState([])
	useEffect(() => {
		const getLists = async () => {
			const data = await axios.get(name)
			setLists(data)
		}
		getLists()
	}, [name])
	return lists
}
export default useAxios

// 组件B/D：
import React from 'react'
import useAxios from '../customHooks/useAxios'
function B() {
	const lists = useAxios('xxx/xxxx')//数据请求地址
	return(
		//渲染
		<>
			{lists.map(item) => ()}
		</>
	)
}
export default B
```

    下面对比用类组件实现：

    类组件：**HOC(高阶组件)与Render Props**

```js
// 组件B/D:
import React, {Component} from 'react'
import axios from 'axios'
class B extends Component {
	constructor () {
		super()
    	this.state = { lists: [] }
	}

    componentWillMount () {
		const data = await axios.get('xxx/xxxx')//数据请求地址
		this.setState({ lists: data })
    }

    render () {
		//渲染
		return (
			<>
				{this.state.lists.map(item) => ()}
			</>
		)
    }
}
export default B
```

    利用HOC（高阶组件写法如下）：

```js
// wrapWithAjax.js(这是一个HOC):
import React, {Component} from 'react'
import axios from 'axios'
const wrapWithAjax = (WrappedComponent, name) => {
	return class extends Component {
		constructor() {
			super()
			this.state = { lists: [] }
		}
		
		componentWillMount() {
			const data = await axios.get(name)//数据请求地址
			this.setState({ lists: data })
    	}
		
		render() {
			return (
				<WrappedComponent lists={this.state.lists} />
			)
		}
	}
}

// B/D组件:
import React from 'react'
import wrapWithAjax from './wrapWithAjax'
class B extends Component {
    render() {
		//渲染
		return (
			<>
				{this.props.lists.map(item) => ()}
			</>
		)
    }
}
B = wrapWithAjax(B, 'xxx/xxxx')
export default B
```

    通过上面这个例子，可以清除的发现函数式组件自定义hook的方式使用的代码量更少，而且相比HOC更加直观，代码可读性更高也更易于理解。而且通过观察HOC的代码，一个HOC相当于对原来的组件做了一层代理，那么就避免不了‘嵌套地狱’的出现。

## 三、感想

    经过以上分析，我对hook的优缺点有以下一些总结：

    优点：
    1. 通过自定义hook更加易于复用代码
    2. 函数式编程代码更加清晰
    3. 更方便拆分组件
    4. 不用考虑类组件中的this

    缺点：
    1. 响应式的依赖，当业务逻辑复杂时，依赖更加难以管理和维护
    2. 状态不同步，异步逻辑中可能会出现状态不是最新的（具体需要看需求）

    所以，当业务逻辑复杂，用类组件更易于我们维护，也相应降低了开发成本。
