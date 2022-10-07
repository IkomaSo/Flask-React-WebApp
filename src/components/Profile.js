import {useState} from 'react'
import {useParams} from "react-router-dom"
import InfiniteScroll  from "react-infinite-scroller"
import axios from "axios";
import Post from './Post';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const Home = (props) => {
    const [Posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const {username} = useParams();

    const checkFollowing = () => {
        if(localStorage.getItem('currentUser') === username){
            isFollowing===-1 || setIsFollowing(-1)
            return
        }
        axios({
            method: "POST",
            url:"/api/isFollowing/"+username,
            headers: {
                Authorization: 'Bearer ' + props.token
            }
        })
        .then((response) => {
            setIsFollowing(response.data.isFollowing)
        }).catch((error) => {
            if(error.response) {
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
        })
    }

    const[isFollowing, setIsFollowing] = useState(-1)
    checkFollowing()

    const Follow = () => {
        axios({
            method: "POST",
            url:"/api/follow/"+username,
            headers: {
                Authorization: 'Bearer ' + props.token
            }
        })
        .then((res) => {
            setIsFollowing(1)
            res.access_token && props.setToken(res.access_token);
        }).catch((error) => {
            if(error.response) {
                console.log(error.response)
                console.log(error.response.status)
                console.log(error.response.headers)
            }
        })
    }

    const Unfollow = () => {
        axios({
            method: "POST",
            url:"/api/unfollow/"+username,
            headers: {
                Authorization: 'Bearer ' + props.token
            }
        })
        .then((res) => {
            setIsFollowing(-1)
            res.access_token && props.setToken(res.access_token);
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
                                    url:`/api/user/${username}?page=${page}`,
                                    headers: {
                                        Authorization: 'Bearer ' + props.token
                                    }
                                })
            const res = get.data
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
          {Posts.map((post, index) => (<Post post={post} key={index} token={props.token} setToken={props.setToken} removeToken={props.removeToken} />))}
        </>);

    const loader =<div className="loader" key={0}><CircularProgress /></div>;

    return (
        <div>
          <Box style={{padding:'0 0 20px 0'}}>
            <h1 style={{display:'inline'}}>{username}</h1>
            <Box style={{float: 'right', display:'inline-block' }}>
            {isFollowing===-1?<Box></Box>:
                    (isFollowing===0?
                        <Button onClick={Follow}   variant="contained" >Follow</Button>:
                        <Button onClick={Unfollow} variant="outlined">Unfollow</Button>)
            }
            </Box>
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
