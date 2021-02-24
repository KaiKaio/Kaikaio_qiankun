import {
  registerMicroApps,
  runAfterFirstMounted,
  setDefaultMountApp,
  start,
  initGlobalState,
} from "qiankun";
import "./index.less";

import render from "./render/ReactRender";
import SSOLoginHost from "./config/SSOLoginHost";
import axios from './config/fetchInstance'

(function () {

  window.addEventListener(
    "message",
    ({ data: { method, token } }) => {
      if (method === "setToken") {
        localStorage.setItem("token", token);
        window.parent.postMessage(
          {
            msg: "token received",
          },
          SSOLoginHost
        );
      }
    },
    false
  );

  const $checkLogin = document.getElementById("check-login");
  const $noLogin = document.getElementById("no-login");
  const $mainapp = document.getElementById("mainapp");

  const { token } = localStorage;

  if (!token) {
    $mainapp.style.display = "none";
    $checkLogin.style.display = "none";
    $noLogin.style.display = "block";
    return;
  }

  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  axios
    .get("/user/verifyToken")
    .then((res) => {
      $mainapp.style.display = "block";
      $checkLogin.style.display = "none";
      $noLogin.style.display = "none";
      const { setGlobalState } = loadMainServer();
      setGlobalState({
        token,
      });
    })
    .catch(({ response: { status } }) => {
      if (status === 401) {
        $mainapp.style.display = "none";
        $checkLogin.style.display = "none";
        $noLogin.style.display = "block";
      }
    });

  function loadMainServer() {
    /**
     * Step1 初始化应用（可选）
     */
    render({ loading: true });

    const loader = (loading) => render({ loading });

    /**
     * Step2 注册子应用
     */

    registerMicroApps(
      [
        {
          name: "react16",
          entry: "https://admin.kaikaio.com",
          container: "#subapp-viewport",
          loader,
          activeRule: "/react16",
        },
        {
          name: "Vue",
          entry: "//localhost:8081",
          container: "#subapp-viewport",
          loader,
          activeRule: "/vue",
        },
      ],
      {
        beforeLoad: [
          (app) => {
            console.log(
              "[LifeCycle] before load %c%s",
              "color: green;",
              app.name
            );
          },
        ],
        beforeMount: [
          (app) => {
            console.log(
              "[LifeCycle] before mount %c%s",
              "color: green;",
              app.name
            );
          },
        ],
        afterUnmount: [
          (app) => {
            console.log(
              "[LifeCycle] after unmount %c%s",
              "color: green;",
              app.name
            );
          },
        ],
      }
    );

    const { onGlobalStateChange, setGlobalState } = initGlobalState({
      token: "",
    });

    onGlobalStateChange((value, prev) =>
      console.log("[onGlobalStateChange - master]:", value, prev)
    );

    /**
     * Step3 设置默认进入的子应用
     */
    setDefaultMountApp("/");

    /**
     * Step4 启动应用
     */
    start();

    runAfterFirstMounted(() => {
      console.log("[MainApp] first app mounted");
    });

    return {
      onGlobalStateChange,
      setGlobalState,
    };
  }
})();
