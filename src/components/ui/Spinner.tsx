export default function Spinner() {
  return (
    <span aria-label="loading" style={{
      display:"inline-block", width:16, height:16, borderRadius:"50%",
      border:"2px solid #ddd", borderTopColor:"#111", animation:"spin .8s linear infinite",
      verticalAlign:"-2px", marginRight:6
    }} />
  );
}
// globals.css에 회전 키프레임 추가하고 싶다면:
// @keyframes spin{ to{ transform: rotate(360deg) } }
