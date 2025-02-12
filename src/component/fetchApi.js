import config from "../config";

export const fetchApi = async (endPoint, method, data) =>{
    const res = await fetch(`${config.VARTA_APP_URL}${endPoint}`, {
        method: method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const reponseData = await res.json();
      return reponseData;
}
