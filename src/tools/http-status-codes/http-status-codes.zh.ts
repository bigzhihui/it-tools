export interface StatusCodeTranslation {
  name: string
  description: string
}

export const zhStatusCodes: Record<number, StatusCodeTranslation> = {
  100: {
    name: 'Continue (继续)',
    description: '客户端应继续其请求，服务器已收到请求头，正在等待主体。',
  },
  101: {
    name: 'Switching Protocols (切换协议)',
    description: '服务器已同意按照客户端的请求切换通信协议（如升级为 WebSocket）。',
  },
  102: {
    name: 'Processing (处理中)',
    description: '服务器已收到并正在处理请求，但目前尚无可用响应（WebDAV 扩展）。',
  },
  103: {
    name: 'Early Hints (早期提示)',
    description: '服务器在发送最终 HTTP 消息前向客户端预载关键资源链接头。',
  },
  200: {
    name: 'OK (成功)',
    description: '请求已成功，这是成功 HTTP 请求的标准响应。',
  },
  201: {
    name: 'Created (已创建)',
    description: '请求已成功满足，并在服务器上创建了一个或多个新资源。',
  },
  202: {
    name: 'Accepted (已接受)',
    description: '请求已被接受以进行处理，但处理尚未完成（异步处理）。',
  },
  203: {
    name: 'Non-Authoritative Information (非权威信息)',
    description: '请求成功，但返回的有效载荷由转换代理从源服务器响应中修改所得。',
  },
  204: {
    name: 'No Content (无内容)',
    description: '服务器成功处理了请求，并且不返回任何响应主体内容。',
  },
  205: {
    name: 'Reset Content (重置内容)',
    description: '服务器成功处理了请求，要求请求者重置发送该请求的文档视图。',
  },
  206: {
    name: 'Partial Content (部分内容)',
    description: '服务器根据客户端请求头中的 Range 字段仅传递资源的一部分（用于断点续传）。',
  },
  207: {
    name: 'Multi-Status (多状态)',
    description: '后续消息体为 XML 消息，包含多个独立的响应代码（WebDAV 扩展）。',
  },
  208: {
    name: 'Already Reported (已报告)',
    description: 'DAV 绑定的内部成员已在前面部分的多状态响应中列出，不再重复包含（WebDAV 扩展）。',
  },
  226: {
    name: 'IM Used (已使用实例操作)',
    description: '服务器已完成对资源的请求，响应是对当前实例应用一个或多个操作后的结果。',
  },
  300: {
    name: 'Multiple Choices (多种选择)',
    description: '指示针对该资源存在多个可供客户端选择重定向的选项。',
  },
  301: {
    name: 'Moved Permanently (永久移动)',
    description: '请求的资源已永久分配了新的 URI，未来的所有请求都应使用该 URI。',
  },
  302: {
    name: 'Found (临时移动)',
    description: '请求的资源临时分配到了另一个 URI。',
  },
  303: {
    name: 'See Other (查看其他)',
    description: '对请求的响应可以在另一个 URI 上通过 GET 方法找到。',
  },
  304: {
    name: 'Not Modified (未修改)',
    description: '指示资源自上次请求的条件标头指定版本以来未发生变化，直接使用缓存。',
  },
  305: {
    name: 'Use Proxy (使用代理)',
    description: '请求的资源必须通过指定的代理才能访问（由于安全考虑已被弃用）。',
  },
  306: {
    name: 'Switch Proxy (切换代理)',
    description: '不再使用。原意为后续请求应使用指定的代理。',
  },
  307: {
    name: 'Temporary Redirect (临时重定向)',
    description: '请求应使用相同的请求方法在另一个 URI 上重新发起，未来请求仍使用原 URI。',
  },
  308: {
    name: 'Permanent Redirect (永久重定向)',
    description: '请求和未来的所有请求都应使用相同的请求方法在另一个 URI 上重新发起。',
  },
  400: {
    name: 'Bad Request (错误请求)',
    description: '由于明显的客户端错误（如格式错误的请求语法、无效路由），服务器无法处理该请求。',
  },
  401: {
    name: 'Unauthorized (未授权)',
    description: '类似于 403 Forbidden，但专门用于需要身份认证且认证失败或尚未提供的情况。',
  },
  402: {
    name: 'Payment Required (需要付款)',
    description: '保留供将来使用，最初设想用于数字现金或微支付方案。',
  },
  403: {
    name: 'Forbidden (禁止访问)',
    description: '请求有效，但服务器拒绝执行操作。客户端没有访问该资源的权限。',
  },
  404: {
    name: 'Not Found (未找到)',
    description: '服务器无法找到请求的资源，但在未来可能是可用的。',
  },
  405: {
    name: 'Method Not Allowed (方法禁用)',
    description: '目标资源不支持请求中所使用的 HTTP 请求方法（如禁止 POST）。',
  },
  406: {
    name: 'Not Acceptable (不可接受)',
    description: '服务器无法根据客户端请求头中的 Accept 标头生成可接受的内容。',
  },
  407: {
    name: 'Proxy Authentication Required (需要代理授权)',
    description: '客户端必须首先在代理服务器上完成身份认证。',
  },
  408: {
    name: 'Request Timeout (请求超时)',
    description: '服务器等待客户端发送请求的时间已超时。',
  },
  409: {
    name: 'Conflict (冲突)',
    description: '请求由于与目标资源的当前状态冲突而无法处理（例如版本编辑冲突）。',
  },
  410: {
    name: 'Gone (资源已失效)',
    description: '请求的资源在源服务器上已永久不可用，且没有转发地址。',
  },
  411: {
    name: 'Length Required (需要有效长度)',
    description: '服务器拒绝在未定义 Content-Length 请求标头的情况下接受该请求。',
  },
  412: {
    name: 'Precondition Failed (前提条件失败)',
    description: '服务器未满足请求者在请求头字段中设置的一个或多个前提先决条件。',
  },
  413: {
    name: 'Payload Too Large (有效载荷过大)',
    description: '请求提交的数据量大于服务器愿意或能够处理的限度。',
  },
  414: {
    name: 'URI Too Long (URI 过长)',
    description: '客户端提供的请求 URI 长度超过了服务器能够解释或处理的范围。',
  },
  415: {
    name: 'Unsupported Media Type (不支持的媒体类型)',
    description: '请求实体的媒体类型或编码格式不受服务器或请求资源的支持。',
  },
  416: {
    name: 'Range Not Satisfiable (无法满足的请求范围)',
    description: '客户端请求了文件的特定部分，但服务器无法提供该范围（例如超出文件大小）。',
  },
  417: {
    name: 'Expectation Failed (未满足期望值)',
    description: '服务器无法满足请求头中 Expect 字段所规定的要求。',
  },
  418: {
    name: 'I\'m a teapot (我是一只茶壶)',
    description: 'RFC 2324 愚人节笑话：服务器拒绝尝试用茶壶冲泡咖啡。',
  },
  421: {
    name: 'Misdirected Request (误导的请求)',
    description: '请求被定向到了无法生成该响应的服务器（如连接重用导致的路由错误）。',
  },
  422: {
    name: 'Unprocessable Entity (无法处理的实体)',
    description: '请求格式正确，但由于包含语义错误而无法被服务器遵循和处理（WebDAV 扩展）。',
  },
  423: {
    name: 'Locked (已锁定)',
    description: '正在访问的目标资源处于锁定状态，不可修改（WebDAV 扩展）。',
  },
  424: {
    name: 'Failed Dependency (依赖失败)',
    description: '由于先前某个关联请求的失败，导致当前请求也执行失败（WebDAV 扩展）。',
  },
  425: {
    name: 'Too Early (过早)',
    description: '服务器不愿冒险处理可能在 TLS 重连中被重放的早期请求。',
  },
  426: {
    name: 'Upgrade Required (需要升级)',
    description: '客户端应切换到其他协议（例如 TLS/1.3）。',
  },
  428: {
    name: 'Precondition Required (需要先决条件)',
    description: '源服务器要求请求必须附带条件，以防止丢失更新等并发问题。',
  },
  429: {
    name: 'Too Many Requests (请求过多)',
    description: '客户端在给定的时间段内发送了过多请求（受到速率限制）。',
  },
  431: {
    name: 'Request Header Fields Too Large (请求头字段过大)',
    description: '由于单个标头字段或所有标头字段总和过大，服务器拒绝处理该请求。',
  },
  451: {
    name: 'Unavailable For Legal Reasons (因法律原因不可用)',
    description: '服务器由于收到法律法规要求或法庭禁令，拒绝提供该资源的访问。',
  },
  500: {
    name: 'Internal Server Error (服务器内部错误)',
    description: '通用的服务器错误，遇到了未预料的情况且没有更具体的错误消息可用。',
  },
  501: {
    name: 'Not Implemented (未实现)',
    description: '服务器不具备完成请求所需的功能，或不支持当前的请求方法。',
  },
  502: {
    name: 'Bad Gateway (错误网关)',
    description: '作为网关或代理的服务器从上游服务器收到了无效响应。',
  },
  503: {
    name: 'Service Unavailable (服务不可用)',
    description: '服务器目前无法使用（通常由于暂时超载或停机维护导致）。',
  },
  504: {
    name: 'Gateway Timeout (网关超时)',
    description: '作为网关或代理的服务器未能在规定时间内从上游服务器收到响应。',
  },
  505: {
    name: 'HTTP Version Not Supported (HTTP 版本不受支持)',
    description: '服务器不支持或拒绝支持请求中所使用的 HTTP 协议版本。',
  },
  506: {
    name: 'Variant Also Negotiates (变体也协商)',
    description: '透明内容协商导致内部配置产生循环引用错误。',
  },
  507: {
    name: 'Insufficient Storage (存储空间不足)',
    description: '服务器无法存储完成请求表示所需的空间配额（WebDAV 扩展）。',
  },
  508: {
    name: 'Loop Detected (检测到循环)',
    description: '服务器在处理 WebDAV 绑定请求时检测到了无限死循环。',
  },
  510: {
    name: 'Not Extended (未扩展)',
    description: '服务器需要对请求进行进一步的策略扩展才能满足该请求。',
  },
  511: {
    name: 'Network Authentication Required (需要网络身份验证)',
    description: '客户端需要通过网络认证拦截（如公共 Wi-Fi 强制门户认证）才能访问互联网。',
  },
};
