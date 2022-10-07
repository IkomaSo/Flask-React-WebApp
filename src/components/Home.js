import * as React from 'react';
import {useState} from 'react'
import { useNavigate } from "react-router-dom";
import InfiniteScroll  from "react-infinite-scroller"
import axios from "axios";
import Post from './Post';
import { ConnectingAirportsOutlined } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import IconButton from '@mui/material/IconButton';


const Home = (props) => {
    const [Posts, setPosts] = useState([]);
    const [Text, setText] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();

    const sendPost = (event)=>{
        event.preventDefault();
        console.log({
            post: Text,
        });
        if(Text=='') return;
        axios({
            method: "POST",
            url:"/api/submitPost",
            headers: {
                Authorization: 'Bearer ' + props.token
            },
            data:{
                text: Text,
             }
          })
          .then((response) => {
            console.log(response.data)
            setText('')
            navigate('/')
          }).catch((error) => {
            if(error.response) {
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
          })
    }

    const loadMore = async (page) => {
        try{
            const get = await axios({
                                    method: "GET",
                                    url:`/api/home?page=${page}`,
                                    headers: {
                                        Authorization: 'Bearer ' + props.token
                                    }
                                })
            const res = get.data
            res.access_token && props.setToken(res.access_token);
            console.log(res)
            if (res.length < 1) {
                setHasMore(false);
                //console.log(Posts)
                return;
                }
            setPosts([...Posts, ...res])
        }
        catch(error){
            console.log(error)
            await props.removeToken()
            return;
        }
      
    }

    const items = (
        <>
          <ul></ul>
          {Posts.map((post, index) => (<Post post={post} key={index} token={props.token} setToken={props.setToken} removeToken={props.removeToken} />))}
        </>);

    const loader =<div className="loader" key={0}><CircularProgress /></div>;

    return (
        <div>
          <h1>Home</h1>
          <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
            <TextField id="input" 
                       label="Write a new post..." 
                       variant="standard" 
                       fullWidth 
                       multiline 
                       maxRows={5} 
                       value={Text}
                       onChange={(e) => {
                        setText(e.target.value)
                      }}
                       />
            <IconButton
                  aria-label="Post"
                  onClick={sendPost}
                >
                  <SendRoundedIcon color="primary"/>
            </IconButton>
          </Box>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}    //項目を読み込む際に処理するコールバック関数
            hasMore={hasMore}      //読み込みを行うかどうかの判定
            loader={loader}>      {/* 読み込み最中に表示する項目 */}
    
              {items}             {/* 無限スクロールで表示する項目 */}
          </InfiniteScroll>
        </div>
      )

}

export default Home
