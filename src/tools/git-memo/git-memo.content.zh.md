## 基础配置 (Configuration)

配置全局用户信息

```shell
git config --global user.name "[你的名字]"
git config --global user.email "[你的邮箱]"
```

## 起步与克隆 (Get started)

初始化全新的本地 Git 仓库

```shell
git init
```

克隆已有的远程仓库

```shell
git clone [仓库地址URL]
```

## 提交变更 (Commit)

暂存并提交所有已跟踪文件的修改

```shell
git commit -am "[提交说明信息]"
```

将新的修改合并到上一次提交（不修改提交信息）

```shell
git commit --amend --no-edit
```

## 撤销与回滚 (Undo Changes)

修改最近一次提交的说明信息

```shell
git commit --amend
```

撤销最近一次提交，保留工作区所有修改

```shell
git reset HEAD~1
```

撤销最近 N 次提交，保留工作区所有修改

```shell
git reset HEAD~N
```

强行撤销最近一次提交，彻底丢弃所有修改（不可逆）

```shell
git reset HEAD~1 --hard
```

丢弃本地更改，将分支完全重置为远程仓库最新状态

```shell
git fetch origin
git reset --hard origin/[分支名称]
```

## 常用杂项 (Miscellaneous)

将本地 master 分支重命名为 main

```shell
git branch -m master main
```
