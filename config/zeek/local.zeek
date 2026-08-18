@load base/protocols/conn
@load base/protocols/dns
@load base/protocols/http
@load base/protocols/ssl
@load base/protocols/ssh
@load base/protocols/ftp
@load base/protocols/smtp
@load base/protocols/dhcp
@load base/frameworks/notice
@load policy/protocols/conn/known-hosts
@load policy/protocols/conn/known-services
@load policy/protocols/ssl/validate-certs
@load policy/tuning/defaults

redef LogAscii::use_json = T;
redef Log::default_rotation_interval = 1hr;
