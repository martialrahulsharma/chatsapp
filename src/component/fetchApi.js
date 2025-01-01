export const fetchApi = async (endPoint, method, data) =>{
    const res = await fetch(`http://localhost:3000/${endPoint}`, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const reponseData = await res.json();
      return reponseData;
}
