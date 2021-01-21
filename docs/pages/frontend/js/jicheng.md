<!--
 * @Author: wjw
 * @Date: 2021-01-21 10:11:01
 * @LastEditTime: 2021-01-21 10:12:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\vuepress-blog\docs\pages\frontend\js\jicheng.md
-->

# JS继承

## 基础知识

### 构造函数

先直接看一个构造函数，Parent就是一个构造函数。

```javascript
function Parent(name) {
	this.name = name
}
const a = new Parent('父亲')
console.log(a.name) // 父亲
```

构造函数也是一个函数，只不过构造函数的函数名推荐首字母大写。通过**new**调用构造函数会创建一个该构造函数的**实例对象**，并且把构造函数中的**this**指向该实例对象。

### 原型
每一个构造函数被创建的时候，都会默认初始化一个原型对象，`Parent.prototype`就是Parent构造函数的原型对象；并且通过实例对象`a.__proto__`也可以访问到该原型对象；而原型对象上存在一个属性`Parent.prototype.constructor`又指回了Parent构造函数；所以构造函数，原型对象，实例对象存在以下的关系。
![](http://doc.leading.io/uploads/blog/202011/attach_164b53aa56c6d75b.png)
并且，实例可以访问原型上的任意属性，也就是实例继承于原型，看如下代码：

```javascript
Parent.prototype.country = '中国'
console.log(a.country) // 中国
```

当获取值时，会先在a自身上寻找country属性，如果没有会在对应的原型上找。

```javascript
Parent.prototype.country = '中国'
a.country = '外国'
console.log(a.country)  // 外国
console.log(Parent.prototype.country) // 中国
```

当设置值时，如果a自身没有这个属性，则会在a自身上创建这个属性，并不会修改原型上的值。

**注意：**如果直接给原型对象赋值，那一定要手动改原型对象上的constructor属性，否则会造成原型链结构混乱，如下：

```javascript
Parent.prototype = {
	country: '中国'
}
console.log(Parent.prototype.constructor === Object) // true 因为{}本质时由Object构造函数创建的，所以指向了Object
// 而这里应该还是要指向Parent，因此需要手动更改
Parent.prototype.constructor = Parent
```

## 继承

### 利用构造函数继承

```javascript
function Animal(special) {
	this.special = special
	this.fishList = ['a', 'b']
	this.eat = function() {
		console.log('我会吃')
	}
}
function Cat(name,special) {
	this.name = name;
	Animal.call(this,special)
}
const cat_1 = new Cat('小花', '猫科')
const cat_2 = new Cat('小红', '猫科')
console.log(cat_1.special, cat_2.special) //"猫科" "猫科"
console.log(cat_1.hasOwnProperty('eat')) // true
console.log(cat_2.hasOwnProperty('eat')) // true
cat_1.fishList.push('c')
console.log(cat_1.fishList) // ['a', 'b', 'c']
console.log(cat_2.fishList) // ['a', 'b']
```

上例中，在Cat构造函数中通过call方法改变了Animal调用时this的指向，因此当通过new创建实例时，this都指向创建的实例对象。
优点：可以给父构造函数传参，不会共用实例属性
缺点：实例方法会重复创建(由`cat_1.hasOwnProperty === true`可以看出，该方法可以判断某一属性是否存在于对象本身，而非原型链上)

### 原型继承

```javascript
function Animal() {
	this.fishList = ['a','b']
}
Animal.prototype.eat = function() {
	console.log('我会吃')
}
function Cat(name) {
	this.name = name;
}
Cat.prototype = new Animal()
Cat.prototype.constructor = Cat
const cat_1 = new Cat('小花')
const cat_2 = new Cat('小红')
console.log(cat_1.name, cat_2.name) //"小花" "小红"
console.log(cat_1.hasOwnProperty('eat')) // false
console.log(cat_2.hasOwnProperty('eat')) // false
cat_1.fishList.push('c')
console.log(cat_1.fishList) // ['a', 'b', 'c']
console.log(cat_2.fishList) // ['a', 'b', 'c']
```

上例中，将Animal的实例赋值给Cat的原型对象，那么Cat的实例继承Cat的原型对象就继承了Animal。
注意，在上面的代码中`cat_1.fishList.push('c')`，导致了实例cat_2的fishList也发生了变化，那是因为fishLish是引用类型，存储的是地址，因此都会发生改变。而如果直接`cat_1.fishList = ['a','b','c']`，这样不会使其他实例也发生变化，在上面也提到过，如果直接给实例赋值某个属性，那么会在实例自身上找，如果不存在直接赋值，不会去原型链上查找。
优点：共用实例属性和方法，不会重复创建
缺点：不能给父构造函数传参，修改引用类型的值可能导致其他实例对应属性也发生变化。

### 组合继承
既然构造函数继承和原型继承各有优缺点，那这里将两种方法组合一下。

```javascript
function Animal(special) {
	this.special = special
	this.fishList = ['a', 'b']
}
Animal.prototype.eat = function() {
	console.log('我会吃')
}
function Cat(name) {
	this.name = name;
	Animal.call(this, '猫科')
}
Cat.prototype = new Animal()
Cat.prototype.constructor = Cat
const cat_1 = new Cat('小花')
const cat_2 = new Cat('小红')
console.log(cat_1.name, cat_2.name) //"小花" "小红"
console.log(cat_1.hasOwnProperty('eat')) // false
console.log(cat_2.hasOwnProperty('eat')) // false
cat_1.fishList.push('c')
console.log(cat_1.fishList) // ['a', 'b', 'c']
console.log(cat_2.fishList) // ['a', 'b']
```

在上例中，将构造函数继承与原型继承组合起来，既实现了可以给父构造函数传参，并且不会导致引用类型数据变动问题；也实现了公共方法不被重复创建。但是上述方法仍然存在一个问题就是：在给`Cat.prototype`赋值的时候通过`new Animal()`创建了一个无用的实例，在这里`Cat.prototype = new Animal()`仅仅是为了让其继承`Animal.prototype`；其他的属性都在`new Cat()`的时候，在内部通过`Animal.call(this,'猫科')`实现继承了。

### 寄生组合继承

```javascript
function Animal(special) {
	this.special = special
	this.fishList = ['a', 'b']
}
Animal.prototype.eat = function() {
	console.log('我会吃')
}
function Cat(name) {
	this.name = name;
	Animal.call(this, '猫科')
}
// 关键的三行代码 创建一个空的构造函数当作中间介质。
var F = function() {}
F.prototype = Animal.prototype
Cat.prototype = new F()

Cat.prototype.constructor = Cat
const cat_1 = new Cat('小花')
const cat_2 = new Cat('小红')
console.log(cat_1.name, cat_2.name) //"小花" "小红"
console.log(cat_1.hasOwnProperty('eat')) // false
console.log(cat_2.hasOwnProperty('eat')) // false
cat_1.fishList.push('c')
console.log(cat_1.fishList) // ['a', 'b', 'c']
console.log(cat_2.fishList) // ['a', 'b']
```

## 非构造函数继承

### 深拷贝（不考虑环状结构数据，如需考虑请参考文章最后一则链接）

```javascript
// 深拷贝  递归调用，利用传递引用类型数据是传递地址的特点
function deepCopy(p, c) {
  var c = c || {}
  for(var key in p) {
    if(typeof p[key] === 'object') {
      c[key] = p[key].constructor === Array ? [] : {}
      deepCopy(p[key],c[key])
    } else {
      c[key] = p[key]
    }
  }
  return c
}
const obj1 = {
  id: 1,
  name: '张三',
  children: [
    {
      id: 2,
      name: '李四',
      children: [
        {
          id: 3,
          name: '王五'
        }
      ]
    },
    {
      id: 4,
      name: '六七'
    }
  ]
}

const obj2 = deepCopy(obj1, {})
console.log('深拷贝,obj2', obj2)
```

通过递归调用，将每一个属性都通过浅拷贝的方式copy即可。

## 参考文章

[Javascript面向对象编程（二）：构造函数的继承](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance.html "Javascript面向对象编程（二）：构造函数的继承")
[Javascript面向对象编程（三）：非构造函数的继承](http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_inheritance_continued.html "Javascript面向对象编程（三）：非构造函数的继承")
[第 6 题：请分别用深度优先思想和广度优先思想实现一个拷贝函数？](https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/10 "第 6 题：请分别用深度优先思想和广度优先思想实现一个拷贝函数？")