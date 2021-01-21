<!--
 * @Author: wjw
 * @Date: 2021-01-20 16:12:36
 * @LastEditTime: 2021-01-20 17:39:31
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \react-punkd:\work\vuepress-blog\docs\pages\frontend\js\replace方法.md
-->

# replace方法使用：用于替换字符串中的某些字符

 使用方法：str.replace(string/reg,string/function)

 replace方法第一个参数可以接受一个字符串或者一个正则表达式。
 第二个参数可以是字符串或者函数。如果第二个参数为函数时：

 function($0,$1,$2)  $0为匹配到字符串，$1为匹配到的字符串的首字符索引，$2为整个字符串本身。
