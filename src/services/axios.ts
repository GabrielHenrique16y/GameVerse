import axios from "axios";

export default axios.create({
    baseURL: 'http://localhost:7900/api',
});