import axios from 'axios'
import { toast } from 'react-toastify'
import { handleLogoutAPI, refreshTokenAPI } from '~/apis'

//Khởi tạo axios instance
let  authorizedAxiosInstance = axios.create({})

//Thời gian chờ tối đa: 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10 // 1 hour

// Gửi cookie theo yêu cầu
// Use Cookie
// authorizedAxiosInstance.defaults.withCredentials = true

// Cấu hình interceptor để thêm token vào header

// Add a request interceptor
authorizedAxiosInstance.interceptors.request.use((config) =>{
    //Lấy access token từ localStorage
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }


    return config
  }, (error) => {
    // Do something with request error
    return Promise.reject(error)
  })

//Khởi tạo promise để tránh việc gọi nhiều lần API refresh token khi có nhiều request cùng lúc
let refreshTokenPromise = null


// Add a response interceptor
authorizedAxiosInstance.interceptors.response.use((response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response
  }, (error) => {
    // Nếu BE trả về 401 thì force logout
    if (error.response?.status === 401) {
      console.log('code go here')
      handleLogoutAPI().then(() => {
        // Xóa userInfo khỏi localStorage
        // Use Cookie
        // localStorage.removeItem('userInfo')
        
        // Điều hướng về trang đăng nhập (dùng JS thuần thay cho react-router-dom - sẽ làm mất state của react-router-dom)
        location.href = '/login'
      })
    }
    // Nếu BE trả về 410 thì gọi API refresh token để làm mới accessToken
    const originalRequest = error.config
    if (error.response?.status === 410 && originalRequest) {
      if (!refreshTokenPromise) {
        //Lấy refresh token từ localStorage (cho trường hợp dùng localStorage)
      const refreshToken = localStorage.getItem('refreshToken')

      //Gọi API refresh token
      refreshTokenPromise = refreshTokenAPI(refreshToken)
        .then((res) => {
          const { accessToken } = res.data
          localStorage.setItem('accessToken', accessToken)
          authorizedAxiosInstance.defaults.headers.Authorization = `Bearer ${accessToken}`

          // Đồng thời lưu ý accessToken cũng đã được update lại ở Cookie (cho trường hợp dùng cookie)
        })
        .catch((_error) => {
          //Nếu nhận lỗi từ API refresh token thì force logout
          handleLogoutAPI().then(() => {
            // Xóa userInfo khỏi localStorage
            // Use Cookie
            // localStorage.removeItem('userInfo')

            // Điều hướng về trang đăng nhập (dùng JS thuần thay cho react-router-dom - sẽ làm mất state của react-router-dom)
            location.href = '/login'
          })
          return Promise.reject(_error)
        })
        .finally(() => {
          refreshTokenPromise = null // Reset promise after completion
        })
      }

      // trả về promise để chờ đợi kết quả của việc refresh token
      return refreshTokenPromise.then(() => {
        //return lại axios instance + originalRequest để gọi lại những API ban đầu bị lỗi
        return authorizedAxiosInstance(originalRequest)
      })
    }

    // Do something with response error
    if(error.response?.status !== 410){
      toast.error(error.response?.data?.message || error?.message)
    }
    return Promise.reject(error)
  })


export default authorizedAxiosInstance
