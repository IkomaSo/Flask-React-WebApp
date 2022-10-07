import {useState} from 'react'
import {useParams} from "react-router-dom"
import InfiniteScroll  from "react-infinite-scroller"
import axios from "axios";
import Post from './Post';
import CircularProgress from '@mui/material/CircularProgress';

const Home = (props) => {
    const [Posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const {searchText} = useParams();

    const loadMore = async (page) => {
        try{
            const get = await axios({
                                    method: "POST",
                                    url:`/api/search?page=${page}`,
                                    headers: {
                                        Authorization: 'Bearer ' + props.token
                                    },
                                    data: {
                                        text: searchText
                                    }
                                })
            const res = get.data
            res.access_token && props.setToken(res.access_token);
            //console.log(res)
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
          {Posts.map((post, index) => (<Post post={post} key={index} token={props.token} setToken={props.setToken} removeToken={props.removeToken}/>))}
        </>);

    const loader =<div className="loader" key={0}><CircularProgress /></div>;

    return (
        <div>
          <h1>Results</h1>
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
