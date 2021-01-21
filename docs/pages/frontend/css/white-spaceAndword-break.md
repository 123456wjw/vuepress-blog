<!--
 * @Author: wjw
 * @Date: 2021-01-20 16:11:07
 * @LastEditTime: 2021-01-20 17:41:05
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\vuepress-blog\docs\pages\frontend\css\white-space与word-break.md
-->

# white-space与word-break

white-space属性：（处理空格）

 normal：默认值，文本多个空格会合并成一个空格，换行符也当成空格 。
 当出现空格时，如果后面的字符串长度超了，则会换行。
 但是对于出现了中文来说即使没有空格出现，长度超了也会自动换行。

 nowrap：文本多个空格会合并成一个空格，换行符也当成空格，但是永远不会换行。
 常常配合overflow：hidden；text-overflow：ellipsis；使用来达到超出显示...的效果。

 pre：不会合并空格，不会因为空格换行，只遇到`<br>`或者回车会换行。

 pre-line：会合并空格，当出现空格时，如果空格后面的内容超了长度，则会换行。
 遇到回车则换行。如果有中文，则即使没有空格，也会根据长度自动换行。

 pre-wrap：不会合并空格，当出现空格时，如果空格后面的内容超了长度，则会换行。
 遇到回车则换行。如果有中文，即使没有空格，也会根据长度自动换行。

word-break属性：（处理换行）

 break-all：会根据盒子长度，超出即换行

 keep-all：只有在空格或者连字符'-'出现时才会根据长度进行换行