'use client';

export const KakaoMap = () => {
  return (
    <div style={{width: "100%", height: "360px", position: "relative"}}>
      <div style={{height: "360px"}}>
        <a href="https://map.kakao.com/?urlX=576595.0&amp;urlY=1032815.0&amp;itemId=10774645&amp;q=%EC%A7%80%EC%82%B0%ED%8F%AC%EB%A0%88%EC%8A%A4%ED%8A%B8%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%EC%8A%A4%ED%82%A4%EC%9E%A5&amp;srcid=10774645&amp;map_type=TYPE_MAP&amp;from=roughmap" 
           target="_blank" 
           rel="noopener noreferrer"
           className="block h-full">
          <img 
            className="w-full h-full object-cover"
            src="http://t1.daumcdn.net/roughmap/imgmap/0fb2bb0e37ff348641b3ffc799a99fe9a29aabb8986adc7568b674d59d16ab0e" 
            alt="Kakao Map"
            style={{border: 0}}
          />
        </a>
      </div>
      <div style={{position: "absolute", left: 0, bottom: 0, width: "100%", padding: "7px 11px", background: "rgba(249, 249, 249, 0.8)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <a href="https://map.kakao.com" target="_blank" rel="noopener noreferrer">
          <img 
            src="//t1.daumcdn.net/localimg/localimages/07/2018/pc/common/logo_kakaomap.png" 
            width="72" 
            height="16" 
            alt="카카오맵"
          />
        </a>
        <div style={{fontSize: "11px", display: "flex", gap: "8px", alignItems: "center"}}>
          <a 
            target="_blank" 
            rel="noopener noreferrer"
            href="https://map.kakao.com/?from=roughmap&amp;srcid=10774645&amp;confirmid=10774645&amp;q=%EC%A7%80%EC%82%B0%ED%8F%AC%EB%A0%88%EC%8A%A4%ED%8A%B8%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%EC%8A%A4%ED%82%A4%EC%9E%A5&amp;rv=on" 
            className="text-black no-underline hover:underline"
          >
            로드뷰
          </a>
          <span className="w-px h-3 bg-gray-300"></span>
          <a 
            target="_blank"
            rel="noopener noreferrer" 
            href="https://map.kakao.com/?from=roughmap&amp;eName=%EC%A7%80%EC%82%B0%ED%8F%AC%EB%A0%88%EC%8A%A4%ED%8A%B8%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%EC%8A%A4%ED%82%A4%EC%9E%A5&amp;eX=576595.0&amp;eY=1032815.0" 
            className="text-black no-underline hover:underline"
          >
            길찾기
          </a>
          <span className="w-px h-3 bg-gray-300"></span>
          <a 
            target="_blank"
            rel="noopener noreferrer" 
            href="https://map.kakao.com?map_type=TYPE_MAP&amp;from=roughmap&amp;srcid=10774645&amp;itemId=10774645&amp;q=%EC%A7%80%EC%82%B0%ED%8F%AC%EB%A0%88%EC%8A%A4%ED%8A%B8%EB%A6%AC%EC%A1%B0%ED%8A%B8%20%EC%8A%A4%ED%82%A4%EC%9E%A5&amp;urlX=576595.0&amp;urlY=1032815.0" 
            className="text-black no-underline hover:underline"
          >
            지도 크게 보기
          </a>
        </div>
      </div>
    </div>
  );
};
