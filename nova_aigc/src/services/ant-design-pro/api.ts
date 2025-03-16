// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /api/currentUser */
export async function currentUser(options?: { [key: string]: any }) {
  return request<{
    data: API.CurrentUser;
  }>('/django/aigc/get-userinfo/', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
// export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
//   return request<API.LoginResult>('/api/login/account', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     data: body,
//     ...(options || {}),
//   });
// }

export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  var req = request<API.LoginResult>(
    '/django/aigc/api-token-auth/',
    // '/api/login/account',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: body,
      skipErrorHandler: true, // Skip the error handler for this request
      ...(options || {}),
    });
  // return request<API.LoginResult>('/backend/api/token/', {
  return req
}

/** 此处后端没有提供注释 GET /api/notices */
export async function getNotices(options?: { [key: string]: any }) {
  return request<API.NoticeIconList>('/api/notices', {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取规则列表 GET /api/rule */
export async function rule(
  params: {
    // query
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.RuleList>('/api/rule', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 更新规则 PUT /api/rule */
export async function updateRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data:{
      method: 'update',
      ...(options || {}),
    }
  });
}

/** 新建规则 POST /api/rule */
export async function addRule(options?: { [key: string]: any }) {
  return request<API.RuleListItem>('/api/rule', {
    method: 'POST',
    data:{
      method: 'post',
      ...(options || {}),
    }
  });
}

/** 删除规则 DELETE /api/rule */
export async function removeRule(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/rule', {
    method: 'POST',
    data:{
      method: 'delete',
      ...(options || {}),
    }
  });
}

/** chatbox */

// 封装请求函数
export async function streamRequest(message,activeKey) {
    const token = localStorage.getItem('access_token')
    const headers = {
    'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
  };

  return fetch(`/django/aigc/stream/${activeKey}/`, {
          method: 'POST', // 使用 POST 方法发送数据
          headers: headers,
          body: JSON.stringify(message ? { message: message } : {} ), // 将消息内容作为 JSON 发送
        });
}

/** 新建 conversation /api/rule */
export async function newConversation_post() {
  return request<API.NewConversationType>('/django/aigc/conversation/new/', {
    method: 'POST',
    data:{
      method: 'post',
    }
  });
}

/** 新建 conversation /api/rule */
export function pullSentences(con_uuid?:number) {
  return request<API.conversation_list_Type>('/django/aigc/conversation/sentences/query/', {
    method: 'POST',
    data:{
      con_uuid: con_uuid?con_uuid:null,
    }
  });
}
