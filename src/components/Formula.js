/**
 * 公式编辑器
 * @param
 * showModal:false,   //是否显示
   title:"提示",    // 标题
   hasClose:true,   // 是否可以关闭
   hasSureFn:'',    // 确认按钮的回调函数
   hasCancelFn:'',  // 取消按钮的回调函数
   hasCancel:false,  // 是否显示取消按钮
   sureTxt:'确定',    // 确认按钮文字
   cancelTxt:'取消'   //取消按钮文字
 *
 */
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
// import Config from '../../config';
function getConfig() {
  let serverUrl = 'http://59.110.123.20/ficloud';
  // 本地调试环境不进行auth
  if (process.env.NODE_ENV === 'development') {
    serverUrl = 'http://10.3.14.240/ficloud';
  }
  // var serverUrl = "http://127.0.0.1:8080/ficloud";
  return {
    workechart: {
      metatree: serverUrl + '/echart/metatree'
    }
  };
}
const Config = getConfig();

let inittree = false;
export default class Formula extends React.Component {
    constructor(props) {
        super(props);
        props;
        this.state = {
            showModal:false,
            title:"公式编辑器",
            cancelTxt:'取消',
            sureTxt:'确定'    // 确认按钮文字
        }
    }

    close = () => {
    	inittree = false;
        this.setState({ showModal: false });
    }

    showAlert = (para) =>{
        let _this = this;
        _this.setState({
            showModal: true
        },function () {
            let _dialog = $(".static-modal .modal-dialog");
            let _scrollTop = $(top.document).scrollTop();
            let _marginTop = _scrollTop === 0 ? 30 : _scrollTop;
            _dialog.css({"margin-top":_marginTop+"px"});
        });
    }
    sureFn = () => {
        //begin在此处写逻辑
        let data = document.getElementById('textarea').value;//"formula";
        this.props.backFormula(data);
        //end在此处写逻辑
        this.close();
    }
    
    insertText = (str)  => {
    	var obj = document.getElementById('textarea');
        if (document.selection) {
            var sel = document.selection.createRange();
            sel.text = str;
        } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            var startPos = obj.selectionStart,
            	endPos = obj.selectionEnd,
                cursorPos = startPos,
                tmpStr = obj.value;
            obj.value = tmpStr.substring(0, startPos) + str + tmpStr.substring(endPos, tmpStr.length);
            cursorPos += str.length;
            obj.selectionStart = obj.selectionEnd = cursorPos;
        } else {
            obj.value += str;
        }
    }

    moveEnd = ()   => {
    	var obj = document.getElementById('textarea');
        obj.focus();
        var len = obj.value.length;
        if (document.selection) {
            var sel = obj.createTextRange();
            sel.moveStart('character',len);
            sel.collapse();
            sel.select();
        } else if (typeof obj.selectionStart == 'number' && typeof obj.selectionEnd == 'number') {
            obj.selectionStart = obj.selectionEnd = len;
        }
    }
    
    showEnv = (tid)   => {
    	for(var index=1;index<=2;index++){
    		var obj = $('#env'+index);
    		var title = $('#envtitle'+index);
        	if(!obj.hasClass('none')){
        		obj.addClass('none');
        	}
        	if(tid!=index  ){
        		if(!title.hasClass('btn-default')){
            		title.addClass('btn-default');
            	}
            	if(title.hasClass('btn-primary')){
            		title.removeClass('btn-primary');
            	}
        	}
        	
    	}
    	
    	var obj = $('#env'+tid);
    	if(obj.hasClass('none')){
    		obj.removeClass('none');
    	}
    	var title = $('#envtitle'+tid);
    	if(title.hasClass('btn-default')){
    		title.removeClass('btn-default');
    	}
    	if(!title.hasClass('btn-primary')){
    		title.addClass('btn-primary');
    	}
    	
    	var that = this;
    	
    	if(!inittree ){
    		inittree = true;
    		var eid = this.props.eid ;
    		 $.get(Config.workechart.metatree,{eid:eid},function (data) {
    	            if (!data.success) {
    	                return;
    	            }
    	            var ret =  that.buildTree( data.data );
    	            $("#mytree").append( ret );
    	            $("#mytree").treeview() ;
    	    		$(".formula-tree-leaf").each(function (i, o) {
    	    			$(o).click(function(){ 
    	    				var text =  $(o).find('span').text();
    	               	 	that.insertText( ' '+text +' ');
    	    			});
    	             });
    	            
    			 });
    		 
    	}
    }
    showContent = (tid)   => {
    	for(var index=1;index<=3;index++){
    		var obj = $('#content'+index);
    		var title = $('#title'+index);
        	if(!obj.hasClass('none')){
        		obj.addClass('none');
        	}
        	if(tid!=index  ){
        		if(!title.hasClass('btn-default')){
            		title.addClass('btn-default');
            	}
            	if(title.hasClass('btn-primary')){
            		title.removeClass('btn-primary');
            	}
        	}
        	
    	}
    	
    	var obj = $('#content'+tid);
    	if(obj.hasClass('none')){
    		obj.removeClass('none');
    	}
    	var title = $('#title'+tid);
    	if(title.hasClass('btn-default')){
    		title.removeClass('btn-default');
    	}
    	if(!title.hasClass('btn-primary')){
    		title.addClass('btn-primary');
    	}
    }
    
    buildTree = (datas,parentKey)   => {
    	var ret ='';
    	var that = this;
    	if(parentKey){
    		parentKey = parentKey+'.';
    	}else{
    		parentKey ='';
    	}
    	for(let index=0;index<datas.length;index++){
    		var data = datas[index];
    		var code = data['code'];
    		var name = data['name'];
    		var children = data['children'];
    		
    		if(children && children.length>0){
    			var childrenStr = that.buildTree(children, parentKey+code );
    			ret = ret +'<li><span class="folder">'+name+'</span> <ul>' +childrenStr+'</ul></li>'; 
    		}else{
    			ret = ret + '<li><span class="formula-tree-leaf"><span class="none">'+parentKey+code+'</span>'+name+'</span></li>';
    		}
        }
    	return ret ;
    }
    componentDidMount() {
		
    }
    render () {
        let _this=this;
        return (
            <Modal show ={this.state.showModal} onHide={this.close} className ="static-modal">
                <Modal.Header closeButton>
                    <Modal.Title>{this.state.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <table> 
                    	<tr> 
                    		<td colSpan="2">
                    			<textarea  id = 'textarea'  rows="8" cols="70"></textarea>
                    		</td>
                    	 </tr>
                    	 
                    	 <tr>
                 			<td>
		                    	<table className="formula-table"> 
		                    		<tr>
			        					<td>  <a id="title1" className="btn  btn-primary"  onClick={_this.showContent.bind(_this,'1')}>数学函数</a> </td>
			        					<td>  <a id="title2"  className="btn btn-default "  onClick={_this.showContent.bind(_this,'2')}>字符串函数</a> </td>
			        					<td>  <a id="title3"  className="btn btn-default "  onClick={_this.showContent.bind(_this,'3')}>自定义函数</a>  </td>
			        				</tr>
			        				<tr>
			        					<td colSpan="4" > 
			        						<div id="content1" className="formula-div">
			        							<table >
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,'max( , )')}><kbd> max </kbd></a>  </td>    <td>取最大值 </td> </tr>
			        								<tr><td> <a  className="formula-a"  onClick={_this.insertText.bind(_this,'min( , )')}><kbd> min </kbd></a>  </td>	 <td>取最小值 </td> </tr>
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,'abs(  )')}><kbd> abs </kbd></a>  </td>		 <td>取绝对值 </td> </tr>
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,'sin( )')}><kbd> sin </kbd></a>  </td> 		<td>取sin值 </td> </tr>
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,'cos( )')}><kbd> cos </kbd></a>  </td> 		<td>取cos值 </td> </tr>
			        							</table>
			        						</div> 
			        						<div id="content2" className="formula-div none">
				        						<table >
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,'concat( , )')}><kbd> concat </kbd></a>  </td>   <td>字符串拼接 </td></tr>
			        								<tr><td> <a  className="formula-a"  onClick={_this.insertText.bind(_this,'length(  )')}><kbd> length </kbd></a>  </td>   <td>取字符串长度 </td></tr>
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,'substr( , )')}><kbd> substr </kbd></a>  </td>   <td>substr(index,length) ,取指定长度字符串 </td></tr>
		        								</table>
			        						</div> 
			        						<div id="content3" className="formula-div none">
				        						<table >
		        									<tr><td> <a  className="formula-a"  onClick={_this.insertText.bind(_this,' iif( , , )')}><kbd> Iif </kbd></a>  </td>  <td>条件判断语句 </td></tr>
		        									<tr><td> <a  className="formula-a"  onClick={_this.insertText.bind(_this,' cmapping( , , ... )')}><kbd> cmapping </kbd></a>  </td>  <td>对照表 </td></tr>
		        								</table>
		        							</div> 	
			        					
			        					</td>
			        				</tr>
		        				</table>
	        				</td>
	        				
	        				<td>
		        				<table className="formula-table"> 
				        			<tr>
			        					<td>  <a id="envtitle1" className="btn  btn-primary"  onClick={_this.showEnv.bind(_this,'1')}>环境变量</a> </td>
			        					<td>  <a id="envtitle2"  className="btn btn-default "  onClick={_this.showEnv.bind(_this,'2')}>元素</a> </td>
			        				</tr>
			        				<tr>
			        					<td colSpan="2" > 
				        					<div id="env1" className="formula-div">
			        							<table >
			        								<tr><td> <a  className="formula-a" onClick={_this.insertText.bind(_this,' $userid ')}><kbd> userid </kbd></a>  </td>    <td>取当前登录人id </td> </tr>
			        								<tr><td> <a  className="formula-a"  onClick={_this.insertText.bind(_this,' $date ')}><kbd> date </kbd></a>  </td>	 <td>取当前时间 </td> </tr>
			        							</table>
		        							</div> 
		        							
		        							<div id="env2" className="formula-div none">
		        							
			        							<ul id="mytree" className="filetree">
				        							 
				        					    </ul>
		        					    
		        							</div> 
		        						</td>
		        					</tr>
	        					</table>
	        				</td>
	        			 </tr>	
	        			 
                    </table>	 
                    		
                    		
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" onClick={_this.close}>{_this.state.cancelTxt}</Button>
                    <Button bsStyle="primary" onClick={_this.sureFn}>{_this.state.sureTxt}</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
