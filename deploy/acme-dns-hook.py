#!/usr/bin/python3
import os,json,time,pathlib,urllib.request
base='https://api.cloudflare.com/client/v4/zones/74c4bd5ecbd71c430d9c6ce45898525e/dns_records'
headers={'Authorization':'Bearer '+pathlib.Path('/root/.config/cloudflare/lago-token').read_text().strip(),'Content-Type':'application/json'}
def request(url,method='GET',body=None):
 return json.load(urllib.request.urlopen(urllib.request.Request(url,method=method,headers=headers,data=json.dumps(body).encode() if body else None),timeout=30))
if os.environ.get('CERTBOT_AUTH_OUTPUT'):
 ident=os.environ['CERTBOT_AUTH_OUTPUT'].strip().splitlines()[-1]
 if ident and ident.isalnum(): request(base+'/'+ident,'DELETE')
else:
 d=request(base,'POST',{'type':'TXT','name':'_acme-challenge.'+os.environ['CERTBOT_DOMAIN'],'content':os.environ['CERTBOT_VALIDATION'],'ttl':60})
 if not d.get('success'):raise RuntimeError('ACME DNS creation failed')
 time.sleep(25)
 print(d['result']['id'])
