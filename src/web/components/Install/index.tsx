import QRCode from 'qrcode';
import React, { useEffect, useRef, useState } from 'react';
import { getLocalIP, getProxyPort, installCertificate } from '../../modules/bridge';
import { copyText } from '../../modules/copy';
import { Button, Card, Col, message, Row, Tooltip } from '../UI';
import './index.scss';

export default () => {
  const $canvas = useRef<HTMLCanvasElement>(null);
  const [href, setHref] = useState<string>('');
  const [help, setHelp] = useState<string>('');
  const [showURL, setShowURL] = useState<any>('');
  const render = (txt: string) => QRCode.toCanvas($canvas.current, txt, { width: 200});
  const autoInstall = () => {
    installCertificate().then((rs: any) => {
      if (typeof rs === 'string') {
        setHelp(rs);
      } else if (rs?.code === 0) {
        message.success(rs?.msg || '安装证书成功');
      } else {
        message.error(rs?.msg || '安装证书失败');
      }
    });
  };

  useEffect(() => {
    getProxyPort().then((port) => {
      getLocalIP().then((list) => {
        const ips = Array.isArray(list) ? list : [];
        const [ip] = ips.filter((item: string) => item !== "127.0.0.1");
        if (ip) {
          const urlString = `http://${ip}:${port}/install`;
          const url = <span>http://<b onClick={(e) => copyText(e, ip)} style={{color:'red', cursor: 'pointer'}}>{ip}</b>:{port}/install</span>
          render(urlString);
          setHref(urlString);
          setShowURL(url);
        } else {
          const url = `http://127.0.0.1:${port||8888}/install`;
          render(url);
          setHref(url);
        }
      });
    });
  }, []);
  return <div className="install-modal">
    <Row gutter={16}>
      <Col span={8}>
        <Card title="Windows电脑端下载证书" bordered={false}>
          {showURL ? <div className="url">{showURL}</div> : null}
          {href ? <div>
            <Button type="primary" onClick={autoInstall} shape="round">一键安装</Button>
          </div> : null}
        </Card>
      </Col>
      <Col span={8}>
        <Card title="手机端安装证书" bordered={false}>
          <div className="tip-text">请保持手机跟电脑在一个局域网内</div>
          <canvas ref={$canvas} />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="MacOS端安装证书" bordered={false}>
          {help ? <div>
            <div className="tip-text">复制如下命令到 Terminal 执行，即可完成证书安装</div>
            <Tooltip title="点击复制指令">
              <code onClick={(e) => copyText(e, help)}><pre>{help}</pre></code>
            </Tooltip>
          </div> : null}
          {help ? null : <Button type="primary" onClick={autoInstall} shape="round">MacOS安装证书</Button>}
        </Card>
      </Col>
    </Row>
    <Row>
      <div style={{height: 1, borderTop: '1px solid #444', width: '100%'}} />
    </Row>
    <Row>
      <div className="install-helper">
        <Button type="text" onClick={() => window.open(href)} style={{marginRight: 20}}>点击下载证书</Button>
        <a href="https://www.yuque.com/zobor/bo4kgc/txy5nz" target="_blank">安装失败？手动安装证书指引</a>
      </div>
    </Row>
  </div>
}
