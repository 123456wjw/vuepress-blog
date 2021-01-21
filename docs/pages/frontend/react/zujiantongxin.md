<!--
 * @Author: wjw
 * @Date: 2021-01-21 10:03:58
 * @LastEditTime: 2021-01-21 10:09:26
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\vuepress-blog\docs\pages\frontend\react\zujiantongxin.md
-->

## 父子组件通信

### 父传子

    主要通过属性传递的方式：

```js
// App.js(父组件)
import React, { useState } from "react";
import Child from "./Child.js";

export default function App() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const addList = () => {
    if (name !== "") {
      setList((preList) => {
        const newList = [...preList];
        newList.push({ id: preList.length, name });
        return newList;
      });
    }
  };
  return (
    <div className="App">
      <input
        placeholder="请输入名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addList}>添加</button>
      <Child list={list} />
    </div>
  );
}


// Child.js(子组件)
import React from "react";

export default function Child(props) {
  const { list } = props;
  return (
    <ul>
      {list.map((item) => {
        const { id, name } = item;
        return <li key={id}>{name}</li>;
      })}
    </ul>
  );
}

```

    子组件Child.js通过props接收父组件App.js传递过来的list属性，在页面上输入名字，点点击添加即可添加一行，具体请看例子[父子组件传值（父传子）](https://codesandbox.io/s/late-butterfly-2ptpz?file=/src/App.js "父子组件传值")。

### 子传父

    通过调用父组件传递过来的方法，调用方法将参数传递出去，下面的代码在上面父传子代码的基础上做了拓展，添加了删除某一行的功能。

```js
// App.js(父组件)
import React, { useState } from "react";
import Child from "./Child.js";

export default function App() {
  const [name, setName] = useState("");
  const [list, setList] = useState([]);
  const addList = () => {
    if (name !== "") {
      setList((preList) => {
        const newList = [...preList];
        newList.push(name);
        return newList;
      });
    }
  };
  const deleteList = (deleteIndex) => {
    const newList = list.filter((_, index) => index !== deleteIndex);
    setList(newList);
  };
  return (
    <div className="App">
      <input
        placeholder="请输入名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addList}>添加</button>
      <Child list={list} deleteList={deleteList} />
    </div>
  );
}

// Child.js(子组件)
import React from "react";

export default function Child(props) {
  const { list, deleteList } = props;
  return (
    <ul>
      {list.map((name, index) => {
        return (
          <li key={index}>
            {name}
            <span
              style={{
                marginLeft: "30px",
                textDecoration: "underline",
                cursor: "pointer"
              }}
              onClick={() => {
                deleteList(index);
              }}
            >
              删除
            </span>
          </li>
        );
      })}
    </ul>
  );
}

```

    子组件调用父组件传递过来的deleteList方法，并且在调用时将索引index传递给父组件，从而完成删除某一行的功能，具体请看例子[父子组件传值（子传父）](https://codesandbox.io/s/funny-euler-xhffj?file=/src/Child.js:0-584 "父子组件传值（子传父）")。

## 跨级组件

    对于跨级组件来说，可以采用**层层传递属性**的方式来实现组件之间的通信，但是当层级嵌套关系较深的时候，层层传递是比较繁琐且容易出错的，所以这里利用**context**来实现组件通信。
    组件层级关系App>A>B，App中调用了A组件，A组件调用了B组件。

```js
// App.js
import React, { useState, useReducer } from "react";
import listContext from "./listContext";
import A from "./A";

const listReducer = (state, action) => {
  const { type, payload } = action;
  const { list } = state;
  switch (type) {
    case "addList":
      const { name } = payload;
      // 注意这里不能写list.push(name)  永远只能返回新的state，不能改变原来的state
      return { ...state, list: [...list, name] };
    case "deleteList":
      const { deleteIndex } = payload;
      const newList = list.filter((_, index) => index !== deleteIndex);
      return { ...state, list: newList };
    default:
      return state;
  }
};

export default function App() {
  const [name, setName] = useState("");
  const [state, dispatch] = useReducer(listReducer, { list: [] });
  const addList = () => {
    if (name !== "") {
      dispatch({
        type: "addList",
        payload: {
          name
        }
      });
    }
  };
  return (
    <div className="App">
      <input
        placeholder="请输入名字"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={addList}>添加</button>
      <listContext.Provider value={{ state, dispatch }}>
        <A />
      </listContext.Provider>
    </div>
  );
}

// A.js
import React from "react";
import B from "./B";

export default function A() {
  return <B />;
}


// B.js
import React, { useContext } from "react";
import listContext from "./listContext";

export default function B() {
  const { state, dispatch } = useContext(listContext);
  const { list } = state;
  const deleteList = (index) => {
    dispatch({ type: "deleteList", payload: { deleteIndex: index } });
  };
  return (
    <ul>
      {list.map((item, index) => (
        <li
          key={index}
          onClick={() => {
            deleteList(index);
          }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

// listContext.js
import { createContext } from "react";
const listContext = createContext();
export default listContext;
```

    上面代码中，在listContext.js中创建了一个关于list的context；在App.js中通过listContext.Provider能够将value值传递给所有被其包裹的组件。具体请看例子[跨多层组件传值(context)](https://codesandbox.io/s/upbeat-ives-jc5lc?file=/src/App.js "跨多层组件传值(context)")。

## 兄弟组件

    react的数据流是自顶向下的，无法通过react直接进行兄弟组件通信，通常是子组件向父组件传递数据，再有父组件告知另一个子组件。
    组件层级关系App>Child1、Child2，组件App调用了组件Child1和组件Child2，组件Child1和Child2是兄弟组件。

```js
// App.js
import React, { useState } from "react";
import Child1 from "./Child1";
import Child2 from "./Child2";

export default function App() {
  const [child2Value, setChild2Value] = useState({});
  const [deleteItem, setDeleteItem] = useState({});
  const addChild2List = (value) => {
    setChild2Value({ value });
  };
  const deleteChild2List = (index) => {
    setDeleteItem({ index });
  };
  return (
    <div className="App">
      <Child1
        addChild2List={addChild2List}
        deleteChild2List={deleteChild2List}
      />
      <Child2 child2Value={child2Value} deleteItem={deleteItem} />
    </div>
  );
}

// Child1.js
import React, { useState } from "react";

export default function Child1(props) {
  const { addChild2List, deleteChild2List } = props;
  const [inpValue, setInpValue] = useState("");
  const addList = () => {
    if (inpValue) {
      addChild2List(inpValue);
    }
  };
  const deleteList = () => {
    deleteChild2List(0);
  };
  return (
    <>
      <div>
        <h4 style={{ textAlign: "left" }}>我是Child1组件</h4>
        <div style={{ textAlign: "left" }}>
          <input
            placeholder="请输入名字"
            value={inpValue}
            onChange={(e) => setInpValue(e.target.value)}
          />
          <button onClick={addList}>为Child2组件的list添加一项</button>
          <button onClick={deleteList}>删除第一项</button>
        </div>
      </div>
    </>
  );
}


// Child2.js
import React, { useState, useEffect } from "react";

export default function Child2(props) {
  const { child2Value, deleteItem } = props;
  const [list, setList] = useState([]);
  useEffect(() => {
    if (child2Value.value) {
      const { value } = child2Value;
      console.log(value, "value");
      setList((preList) => {
        return [...preList, value];
      });
    }
  }, [child2Value]);
  useEffect(() => {
    setList((preList) => {
      if (preList.length) {
        const newList = preList.filter((_, index) => index !== 0);
        return newList;
      }
      return preList;
    });
  }, [deleteItem]);
  return (
    <ul>
      {list.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
```

    上述代码中，组件Child1中定义了为组件Child2添加和删除列表某一项的方法，再通过App中传递给Child1的方法，将参数传回App组件，再由App通知Child2修改自身list状态，具体请看例子[兄弟组件传值](https://codesandbox.io/s/loving-elbakyan-6fdgc "兄弟组件传值")。

## 总结

    以上便是对react hooks中组件通信方式的一些整理，上面的这些方法能够处理大部分的业务场景。但是如果遇到需要全局共享的状态，例如登录后的身份信息，或者某个组件需要改变全局的状态，或者需要改变一个行不相干的组件的状态，可能需要借助redux来实现这样的需求。
    最后，感谢大家的阅读，如有不足或者错误之处，请各位读者评论指正，谢谢！
