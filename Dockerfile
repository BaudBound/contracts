FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY *.schema.json /usr/share/nginx/html/
COPY nodes/ /usr/share/nginx/html/nodes/

USER nginx

EXPOSE 8080

ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
