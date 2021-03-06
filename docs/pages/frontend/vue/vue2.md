<!--
 * @Author: wjw
 * @Date: 2021-01-19 15:02:23
 * @LastEditTime: 2021-02-22 13:55:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\myblog\docs\pages\frontend\vue\vue2.md
-->

## 响应式原理

### 什么是响应式

从前端的角度可以简单的理解为：当数据发生变化时，页面的DOM也随之发生改变，并且整个数据模型在js中就是一个对象。也就是当你通过js改变数据模型中的数据时，对应的引用该数据的dom也会发生改变。

### Object.defineProperty

要想理解vue的响应式原理，我们首先得了解[Object.defineproperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)这个方法，下面结合一个问题来简单介绍一下这个方法的用法以及作用：
首先我们思考一下如何实现当我们改变一个js对象的时候，让对应的dom发生改变？首先看一下vue的常见结构。

```html
var app = new Vue({
  el: '#app',
  data: {
    count: 0
  },
  methods: {
    addCount() {
      this.count++
    }
  }
})

<div id='app'>
  {{count}}<button @click='addCount'>点我count自增</button>  
</div>
```

那不通过vue如何实现呢，看一下下面的代码

```js
  // 定义数据模型
  let data = {
    count: 0
  }
  var count = data.count
  // 获取dom元素
  const btn = document.querySelector('.btn')
  const input = document.querySelector('.inp')
  // 绑定事件修改数据
  btn.addEventListener('click', function() {
    data.count++
  })
  // 对数据模型进行劫持
  Object.defineProperty(data, 'count', {
    configurable: true,
    enumerable: true,
    get() {
      return count
    },
    set() {
      count++
      // 当监测到数据被修改时，改变dom元素
      input.value = count
    }
  })
  <div>
    <input class='inp' />
    <button class='btn'>点我count自增</button>
  </div>
```

具体案例请移步[Object.defineProperty劫持数据并双向绑定](https://codepen.io/wujiawei/pen/rNWeXgP)，Object.defineProperty第一个参数是被劫持的对象，第二个参数是需要劫持的属性,第三个参数是一个对象，本例中主要运用到了get和set。当我们在事件回调中执行`data.count++`时就会触发`set`方法，在set方法中就可以执行一些需要的操作。
对比两个案例就可以发现区别就是vue的数据劫持以及dom操作都是内部完成的，而我们的方法是自己手动修改的。看完这个案例之后，我们就来结合代码详细分析一下vue响应式原理。

### vue响应式原理

首先看一下官网的解释：

当你把一个普通的 JavaScript 对象传入 Vue 实例作为 data 选项，Vue 将遍历此对象所有的 property，并使用 Object.defineProperty 把这些 property 全部转为 getter/setter。Object.defineProperty 是 ES5 中一个无法 shim 的特性，这也就是 Vue 不支持 IE8 以及更低版本浏览器的原因。

这些 getter/setter 对用户来说是不可见的，但是在内部它们让 Vue 能够追踪依赖，在 property 被访问和修改时通知变更。这里需要注意的是不同浏览器在控制台打印数据对象时对 getter/setter 的格式化并不同，所以建议安装 vue-devtools 来获取对检查数据更加友好的用户界面。

每个组件实例都对应一个 watcher 实例，它会在组件渲染的过程中把“接触”过的数据 property 记录为依赖。之后当依赖项的 setter 触发时，会通知 watcher，从而使它关联的组件重新渲染。
![avatar](https://user-gold-cdn.xitu.io/2018/2/8/1617554b425a3431?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

将上图分为三个阶段：

```text
1.初始化init阶段：主要用来初始化实例并劫持数据

2.解析dom，mount阶段：主要用来解析试图，并收集对应依赖，添加订阅者watcher

3.更新re-render阶段：当数据发生改变，通过watcher改变试图
```

下面我们结合代码来看：

```html
  <div id="app">
    <h2>数据的双向绑定</h2>
    <span v-text="name"></span>
    <input type="text" v-model="name" >
  </div>
```

```js
  // 先定义一个简单的vue类
  class EasyVue {
    constructor(options) {
      // options为初始化实例时传入的参数对象
      this.$options = options
      this.$data = options.data
      this.$el = options.el
      // 初始化依赖收集器 具体作用下面再讲
      this.$deps = {}
      // 1阶段：劫持数据（这里主要对data进行劫持，计算属性和观察属性暂不做处理）
      this.observe(this.$data)
      // 2阶段：解析dom，根据视图将订阅者wather添加到对应依赖中
      this.compile(this.$el)
    }
    // 1阶段
    observe(data) {
      let val
      // 遍历劫持
      for(var key in data) {
        // 收集data中的每个属性为依赖，并且初始化
        this.$deps[key] = []
        // 获取属性值
        val = data[key]
        // 递归劫持 这里只做了简单判断
        if(typeof val === 'object') {
          this.observe(val)
        }
        const deps = this.$deps[key]
        Object.defineProperty(data, key, {
          configurable: true,
          enumerable: true,
          get() {
            // 访问该属性的时候返回对应属性值
            return val
          }
          set(newVal) {
            if(val !== newVal) {
              // 重新赋值，
              val = newVal
              // 数据变化后，遍历依赖收集器，通知对应订阅者watcher更新视图
              // 至于watcher是什么，下面再讲
              deps.forEach(watcher => {
                watcher.update()
              })
            }
          }
        })
      }
    }

    // 2阶段
    compile(el) {
      // 获取对应dom节点
      const node = document.querySelector(el)
      // node.children不是真正的数组，需要转换
      const children = Array.from(node.children)
      // 遍历子节点
      children.foEach(childNode => {
        // 递归解析dom
        if(childNode.children.length) {
          this.compile(childNode.children)
        }
        // 解析具有v-text指令的dom
        if(childNode.hasAttribute('v-text')) {
          // 获取属性值（这个属性值是data上的某一给属性，也就是需要收集的依赖）
          const key = childNode.getAttribute('v-text')
          // 给对应依赖添加对应的订阅者watcher
          this.$deps[key].push(new Watcher(this, childNode, 'innerHTML', key))
        }
        // 解析具有v-model指令并且是input框的dom
        if(childNode.hasAttribute('v-model') && childNode.tagName === 'INPUT') {
          const key = childNode.getAttribute('v-model')
          this.$deps[key].push(new Watcher(this, childNode, 'value', key))
          // v-model为vue的语法糖，手动绑定事件
          childNode.addEventListener('input',() => {
            // 修改data中的数据 会触发被劫持属性的set方法
            this.$data[key] = childNode.value
          })
        }
      })
    }
  }

  class Watcher {
    constructor(vm, el, attr, key) {
      // vue组件实例
      this.vm = vm
      // dom元素
      this.el = el
      // dom元素属性
      this.attr = attr
      // data中的某一数据
      this.key = key
      // 初始化
      this.updata()
    }
    update() {
      this.el[this.attr] = this.vm.$data[this.key]
    }
  }

  // 创建组件实例
  const vue = new EasyVue({
    el: '#app',
    data: {
      name: '张三'
    }
  })
```

通过上面的代码我们可以看出，首先在observe中劫持data中的所有数据，转化为get以及set，这样可以在数据改变时进行视图的更新，并且通过dep将每一个数据作为依赖收集起来；然后通过解析器解析dom上的指令，进行事件绑定并且为每一个依赖添加对应的watcher订阅者；最后当数据改变时，触发了set方法，然后dep中对应的依赖通知watcher进行视图的改变，这就是vue响应式的原理。
具体的案例请移步[vue响应式原理](https://codepen.io/wujiawei/pen/RwGXBZQ?editors=1111)。

下面是对响应式的一些补充，对数组的操作以及添加新属性的方法：

```js
  const arrayPrototype = Array.prototype
  const newPrototype = Object.create(arrayPrototype)
  const methods = ['push','pop','shift','unshift','splice','sort','reverse']
  methods.forEach(method => {
    Object.defineProperty(newPrototype, method, {
      configurable: true,
      enumerable: true,
      value() {
        console.log('监听到了数组变化')
        return arrayPrototype[method].apply(this, arguments)
      }
    })
  });
  function defineProperty(obj, key, val) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        return val
      },
      set(newVal) {
        if(newVal === val) {
          return
        }
        val = newVal
        observer(val)
      }
    })
  }
  function observer(obj) {
    if(typeof obj !== 'object' || obj === null) { // 如果监听的值不是对象直接返回
      return
    }
    if(Object.prototype.toString.call(obj) === "[object Array]") {
      obj.__proto__ = newPrototype
    }
    for(var key in obj) { // 循环监听对象的每一个属性
      if(typeof obj[key] === 'object') {
        observer(obj[key])
      }
      defineProperty(obj, key, obj[key])
    }
  }
  // 为obj设置新的属性时，创建新的监听  对标vue this.$set方法
  function set(obj, key, val) {
    defineProperty(obj, key, val)
  }
  const obj = {name: 'xh', bro: {name: 'xz'}}
  observer(obj)

```

通过以上的分析，应该可以初步理解vue的响应式原理了，更加具体的可以看vue的源码。

## 计算属性computed

计算属性computed：

 当计算属性的依赖发生变化时，那么该计算属性就会发生改变，计算属性的结果是函数的返回值。

使用方法：

``` js
computed：{
 totalPrice() {
  return num*salePrice;
 }
}
```

我们只需要通过 {{}} 或者 v-html 绑定就可以使用该计算属性。

计算属性vs方法：

 当我们要使用的某个值受很多条件影响时，我们可以使用计算属性。
 当然我们也可以通过在{{}}中用调用方法的形式来代替计算属性。
 但是计算属性是具有缓存效果的，也就是说计算属性的依赖未发生变化时，我们多次访问这个计算属性，并不会重复执行涉及到的函数。
 但是使用调用方法的形式则会增加很多不必要的计算。

计算属性vs侦听属性：

 侦听属性watch，侦听属性watch可以检测data中的数据变化，并执行相应函数。
 当我们要使用的数据随着其他数据变化而响应时，我们也可以使用watch来实现。

使用方法：

``` js
watch： {

 money(newmoney,oldmoney) {

  逻辑代码；

 }

}
```

相比之下，在普通的逻辑下，我们用计算属性可能更加方便，但是在涉及到异步请求等异步操作时，我们用侦听器watch可能更加方便来实现我们的需求。

## v-for列表循环key属性

关于key：在我们使用v-for列表渲染时，尽量给循环的DOM节点带上key属性，key相当于是这个节点的唯一标识。
避免我们在改变列表后页面渲染出现问题，尤其是涉及到表单元素时。

我们可以在列表渲染中使用方法，v-for="num in filter(nums)"，filter就是一个方法。

## 动态修改数组与对象

关于想直接修改一个已经渲染在页面上的数组或者对象时：
例如现在有一个数组arr = ['a','b','c']和一个对象obj = {name: '毛不易'}，
如果我们直接在方法中直接通过索引的方式修改或者为数组增加某一项，或者试图为对象增添新的属性，
那么在渲染的时候并不会直接渲染成我们期望的值。

 对此，vue提供了Vue.set(arr,index,value)的方式修改数组或添加的某一项，
 Vue.set(obj,key,value)的方式为对象新增属性。

当我们要为对象增添不止一个属性时：

 我们可以通过 this.obj = Object.assign({},this.obj,{key: value,key: value}) 的方式为对象新增多个属性。

当我们用Vue.set时我们需要导入Vue ，即 import Vue from 'vue'。

Vue.set 也可以写成  this.$set，this就是当前vm实例。

## 修饰符

一、事件修饰符：

 .prevent：阻止默认事件，比如当在textarea中按下回车键会自动换行，
 这时我们通过@keydown.enter.prevent就可以阻止默认的换行行为。

 .stop：阻止事件冒泡，当子盒子与父盒子重叠且均绑定了某一事件，比如点击事件，那么当我们点击子盒子时，该事件会从内向外冒泡。
 那通过给自盒子的点击事件绑定.stop，即@click.stop这样就可以阻止事件向外冒泡。

 .capture：采用事件捕获机制，当某个元素绑定了这个事件修饰符，那么该元素上的这个事件会被最先触发。

 .self：当某个元素的事件采用了这个事件修饰符，那么只有当触发元素是自己本身时，该事件才会触发，不会受到事件冒泡影响而触发。

二、按键修饰符：

 .enter、.tab、.delete、.esc、.space、.up、.down、.left、.right

三、系统修饰符：可以让我们在按下这些键并同时进行点击或按键事件时才触发某个事件

 .ctrl、.alt、.shift、.meta       例如：@click.ctrl   或者  @keydown.ctrl.enter

 .exact修饰符，在系统修饰符后再加上该修饰符表示
 有且只有被指定的修饰符按键被按下才可以触发某事件，
 若直接在事件后加该修饰符表示没有任何修饰符按键被按下才可以触发事件。

四、鼠标按钮修饰符

 .left、.right、.middle

## vue单元测试

vue单元测试：

1.为什么要进行单元测试：前端经常会修改js功能，会造成代码可能会出现其他问题，那么我们需要去测试，但是我们手动去测不方便；或者说多人开发代码不容易阅读；后期维护迭代重构也不方便，所以要写前端单元测试。

2.什么是单元测试：在vue中，一个组件就可以作为一个单元，我们测试就以组件为单元来进行测试。

3.TDD & BDD

 1）TDD（测试驱动开发），在开发之前先编写测试用例代码，然后写代码功能将测试用例跑通，则代表功能完善。用例描述出了哪些功能，很好的诠释了代码即文档。

 2）BDD（行为驱动开发），开发之前，人员一起合作考虑需求，在开发之前完成需求保证功能正确性。

4.测试工具 mocha+chai/jest

 mocha：测试框架，用于跑测试用例；chai：断言库，用于判断功能是否正确

 jest：测试框架。

 karma：支持将运行代码放到浏览器去测；但是现在的node环境，可能只需要测试功能和页面显示对不对，所以我们可以不用karma，用jsdom，这样的好处是不限制只能在浏览器上测试，可以在node中来操作显示dom。

5.如何写测试用例：

 1.首先创建vue项目 要选择unit test这一项

 2.package.json中描述了如何启动测试 "test:unit": "vue-cli-service test:unit"

 3.传统测试我们可能通过在代码中写console.log()的方式来测试我们的逻辑代码运行是否正确，
 但是这种方法繁琐且项目上线后测试代码要删除。

 4.所以我们通过写测试用例的方法来经行单元测试，通常我们将测试的js文件放在tests下的unit目录下，
 且取名通常以xxx.spec.js结尾。

 5.基本测试用例写法

 //引入要测试的方法

``` js
 import {parser,stringfy} from './../../code/parser.js'

 //引入断言库

 import {expect} from 'chai'

 // 将测试用例用describe包裹起来,可以将测试用例分类,describe相当于测试用例套件

 describe('测试parser的',() =>{

  //一个it就是一个测试用例

  it('测试parser是否靠谱',() => {

   expect(parser('name=wjw')).to.be.deep.equal({name: 'wjw'});

  })

 })
```

6.引入测试工具vue-test-utils，可以让我们对组件进行测试，我们的测试一般只关心输入和输出，即用户行为或者data中数据的变化对最终页面渲染或者某一事件的触发所产生的结果。下面测试工具的基本用法：

``` js
 import HelloWorld from './../../src/components/HelloWorld.vue';

 import {expect} from 'chai';

 //导入测试工具

 import {mount} from '@vue/test-utils'

 describe('测试HelloWorld.vue',() => {

  it('测试传递属性后是否显示正常值',() => {

   const wrapper = mount(HelloWorld,{

    propsData: {

     msg: 'hello'

    }

   });

// wrapper.setProps({msg: 'hello'});

   expect(wrapper.find('h1').text()).to.be.contain('hello')

  })

 })
```

7.使用shallowMount，对于某个包含很多子组件的组件来说，通过shallowMount挂载该组件并不会渲染其子组件，从而可以提升测试速度。

8.父组件给子组件传值 注意props:['num']  要加引号  或者props: {num: Number}写对象的形式。子组件触发父组件方法：在子组件绑定的事件处理函数中用this.$emit('事件名')（该事件绑定在父组件上）来触发父组件的事件。

当我们测试时，需要在测试中通过子组件触发父组件事件测试的 具体写法如下：

 const wrapper = mount(HelloWorld);

 const numNode = wrapper.find(counter).find('.num');

 expect(parseInt(numNode.text())).to.be.equal(0);

 wrapper.find(counter).vm.$emit('increase');

 expect(parseInt(numNode.text())).to.be.equal(1);

counter为HelloWorld的子组件，我们在测试文件中需要导入这个子组件，然后通过wrapper.find(counter)来找到这个子组件  注意不要加''

## mixins混入

mixins可以用来分发组件中的可复用功能，可以避免写许多重复的功能。

```js
    var mixin = {
      //混入对象中的数据如果和组件中的数据重复，则取组件中的数据
      data: function () {
        return {
          message: 'hello',
          foo: 'abc'
        }
      },
      //钩子函数会被合并成一个数组，都会被调用，而且混入对象的钩子函数先触发。
      created: function () {
        console.log('混入对象的钩子被调用')
      },
      //methods、components等等对象格式的选项，如果键名和组件中的重复，则以组件中的为准。
      methods: {
        foo: function () {
          console.log('foo')
        },
        conflicting: function () {
          console.log('from mixin')
        }
      }
    }
    
    //在组件中使用mixins：则我可以在该组件中通过this. 获取到混合对象mixin中的任何数据方法与钩子函数。
    var vm = new Vue({
      mixins: [mixin],
      methods: {
        bar: function () {
          console.log('bar')
        },
        conflicting: function () {
          console.log('from self')
        }
      }
    })
```

## 动态组件

动态组件：

 我们可以通过`<component :is="currentCom"></component>`来实现组件的动态切换

 假设我们有三个组件comA，comB，comC

 我们通过切换实例的currentCom的值分别为comA，comB，comC就可以在这三个组件之间切换。

keep-alive：

 当我们使用动态组件时，当组件切换的时候，每次切换组件都会重新渲染组件，

 但是有时我们并不想组件重新渲染，希望组件状态缓存，这时就可以用keep-alive标签将动态组件包裹起来。

 `<keep-alive></keep-alive>`

 属性：include：字符串或者正则表达式。只有名称匹配的组件会被缓存；
 exclude：字符串或者正则，名称匹配的组件不会被缓存。

当组件在keep-alive中切换时，activated和deactivated两个生命周期钩子函数会被触发。

当我们切换出被keep-alive包裹的组件时，deactivated会被触发，切进时activated会被触发，而且由于被缓存了，created和mounted不会被触发。

## 表单元素checkbox和select双向数据绑定

当涉及到多个复选框的选择时，我们可以将复选框的v-model绑定为一个数组，并且为复选框绑定value属性，这样当我们选中这个复选框时，该复选框的value值就会被添加进数组中。

``` html
<div class="checkbox">
 <ul>
  <li v-for="star in stars" :key="star">
   <input type="checkbox" v-model="checkBox" :value="star" :id="star">
   <label :for="star">{{star}}</label>
  </li>
 </ul>
 <br><span>checked names: {{checkBox}}</span>
</div>
// checkBox: []
```

当下拉框选择时，选中某一项的value的属性将会是selected的值

```html
 <select v-model="selected">
  <option disabled value="">请选择</option>
  <option value="A">A</option>
  <option value="B">B</option>
  <option value="C">C</option>
 </select>
```

selected: ''   selected的默认值为空，所以会默认选中value为空的那么选项。

当涉及到下拉多选时，可以把selected绑定为数组。同样被选择的选项的value值会被添加进数组中。

## 表单修饰符

给表单绑定v-model时，我们可以给v-model加表单修饰符，共有三种：

 .number 将用户在input中的输入转为number类型，
 但是如果用户输入字母开始则仍然输出字符串；如果数字开始，则限制输出只为数字。

 .trim 将用户在input中的输入的前后空格去除

 .lazy 表示当用户输入时不直接产生效果，也就是将触发条件input变为了change

## vue插槽的使用

vue插槽的使用：

1.在组件中添加`<slot></slot>`标签，然后在使用该组件的时候，组件标签内的任何节点都会被渲染到这个slot标签中。

``` html
    // 组件MySlot：
    <template>
     <div class="myslot">
            <span>欢迎使用插槽</span>
            <slot></slot>
     </div>
    </template>
    
    // 其他组件使用组件MySlot：
    <my-slot>
        <div>我会被渲染到MySlot组件的slot标签中</div>
    </my-slot>
```

2.可以为`<slot></slot>`标签添加默认内容，当我们在使用组件时没有为插槽提供内容，则显示默认值

`<slot>我是默认值</slot>`

3.给插槽命名，就可以添加多个插槽  具名插槽

``` html
    // 我们在组件中添加这些具名插槽：
    <header>
     <slot name="header"></slot>
    </header>
    <main>
     <slot>我是后备内容，如果使用这个组件时未给我值，那么我就会显示</slot>
    </main>
    <footer>
     <slot name="footer"></slot>
    </footer>
    
    // 在使用组件的时候，在组件标签之间这么写：
    <template v-slot:header>
     我是渲染头部插槽的
    </template>
    <!-- <div>
    	不命名则默认v-slot:default
    </div> -->
    <template v-slot:default>
     这样写也可以
    </template>
    <template v-slot:footer>
     我是渲染底部插槽的
    </template>
```

4.作用域插槽：可以使父组件中插槽的内容访问到子组件中的数据

通过给子组件的slot插槽绑定属性，然后就可以在父组件使用子组件时获取到子组件的数据

``` html
    <slot :person="person"></slot>  // 这个person是在子组件的作用域中的
    
    // 然后在父组件使用时：slotProps是自己取得名字，取什么都可以
    <template v-slot:dafault="slotProps">
     {{slotProps.person}}
    </template>
    // 当用在默认插槽上时 :default 可以省略，但是当出现具名插槽时 :default 还是不能省略
```

## vue自动化全局注册组件

我们有时会用到一些经常需要复用的组件，但是内容又很少，这时我们可以通过自动化注册全局组件来避免在许多组件中大量导入这些小的导入组件或者js文件。

具体做法：在main.js中进行编写：

``` js
    import upperFirst from 'lodash/upperFirst'
    import camelCase from 'lodash/camelCase'
    const requireComponent = require.context(
     //需要自动化全局注册的组件目录
     './components/baseComponents',
     //是否查询其子目录
     false,
     //匹配组件名的正则表达式
     /Base[A-Z]\w+\.(vue|js)$/
    )
    requireComponent.keys().forEach(fileName => {
     //获取组件配置
     const componentConfig = requireComponent(fileName);
     //获取组件的PascalCase命名
     const componentName = upperFirst(
     // 剥去文件名开头的 `'./` 和结尾的扩展名
      camelCase(
       fileName.replace(/^\.\/(.*)\.\w+$/, '$1')
      )
     )
     //全局组件注册
     Vue.component(
      componentName,
      componentConfig.default || componentConfig
     )
    })
```

## vue动画&过渡

1.单元素或组件的过渡：将要过渡的元素或者组件用`<transition></transition>`标签包裹，过渡元素需要与v-show v-if结合使用。可以给transition标签添加一个name属性。

2.过渡类名：

 v-enter、v-enter-acitve、v-enter-to、v-leave、v-leave-active、v-leave-to

 v-enter：进入过渡的开始状态；v-enter-active：进入过渡的持续状态，一般定义过渡属性以及持续时间，运动方式等等；v-enter-to：进入过渡结束时的状态；v-leave：离开过渡的开始状态；v-leave-active：离开过渡的持续状态；v-leave-to：离开过渡结束时的状态。

当我们给了transition标签name属性后，v就需要用name的属性值代替。

3.动画：

定义一个动画：通过@keyframes 动画名 {动画状态}来定义一个动画

``` css
    @keyframes bounce-in {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.5);
      }
      100% {
        transform: scale(1);
      }
    }
```

使用：通过css的animation属性来使用这个动画。

```css
    .bounce-enter-active {
      animation: bounce-in .5s;
    }
    .bounce-leave-active {
      animation: bounce-in .5s reverse;
    }
```

4.自定义过渡类名：

 enter-class、enter-active-class、enter-to-class、leave-class、leave-active-class、leave-to-class

 可以给transition标签添加这些自定义类名，这样就可以给这些类名绑定第三方动画库的动画。

例如：
    `<transition name="custom-classes-transition" enter-active-class="animated tada" leave-active-class="animated bounceOutRight"></transition>`
    其中animated tada与animated bounceOutRight是第三方动画库提供的类

5.同时使用过渡和动画：

1）需要动画在刷新的时候也能有效果：

 给transition标签加appear以及appear-active-class=“与enter-acitve-class相同”这两个属性；

2）以哪一个为结束标准：
 我们可以给transition设置type属性为transition或者animation来规定以哪一个为结束标准。

3）也可以手动给结束时间：

 ：duration=“毫秒单位时间”或者：duration=“{enter：毫秒时间，leave：毫秒时间}”

6.多元素过渡：

当涉及到两个相同标签的元素参与过渡时，我们需要给标签添加key属性来区分两个标签，否则vue只会替换内容，而不会重新渲染标签导致过渡不会生效。

``` js
    <transition name="btn-act" mode="out-in">
     <button v-if="onOrOff=='on'" @click="onOrOff='off'" key="on">{{onOrOff}}</button>
     <button v-else @click="onOrOff='on'" key="off">{{onOrOff}}</button>
    </transition>
    .btn-act-enter,
    .btn-act-leave-to {
     opacity: 0;
    }
    .btn-act-enter-active,
    .btn-act-leave-active {
     transition: all 1s;
    }
```

其中mode属性为设置过渡模式，否则两个标签的过渡会同时进行。过渡模式有in-out、out-in。

当我们需要两个元素能够重叠需要给两个元素position：absolute；

7.多组件过渡：

多组件过渡不需要用到key属性，只需要用transition标签将动态组件component标签包裹起来，再配合过渡模式mode即可。

## Babel-polyfill

Babel不会转换新的API，而只转换新的es6语法，所以当我们在IE低版本浏览器中使用到es6涉及的新的API时，浏览器无法解析。所以我们可以引入babel-polyfill来解决这个问题。

先安装：npm install babel-polyfill --save

再在main.js首行导入 import 'babel-polyfill'

vue2中：修改webpack.base.conf.js

```js
 module.exports = {
  // entry: {
  //   app: './src/main.js'
  // },
  entry: ['babel-polyfill', './src/main.js'],
 }
```
