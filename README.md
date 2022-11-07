# git-sync

## 功能

- 添加多个仓库自动同步。添加的同时可以设置同步时间（单位：秒）
- 查看、删除同步任务状态

## 使用方法

### 安装

```shell
npm install git-sync-repo -g
```

### 使用

前往需要自动同步的仓库根目录下执行 `sync` 命令即可

## Command

```shell
Usage: sync [options]

Options:
  ls, --list           print task list
  l, --loop <loop>     Synchronization time(unit: second). Default 1s
  del, --delete <pid>  delete a task
  -h, --help           display help for command
```

自动同步 git 仓库，把仓库作为云存储来使用

## 运行流程

![alt work process](https://raw.githubusercontent.com/Alex-Programer/git-sync/master/work-process.png)
