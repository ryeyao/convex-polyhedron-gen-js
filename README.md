convex-polyhedron-gen-js
========================

## 配置文件说明

配置文件默认读取路径为该目录的上两级目录，即`../../cfg.json`，使用时请注意。

### container

容器参数。

#### type

容器类型，`cube`或者`cylinder`。

#### options

容器相关配置

##### height

圆柱体容器高度。当容器`type`为`cylinder`时有效。

##### radius

圆柱体半径。当容器`type`为`cylinder`时有效。

##### edge_len

立方体边长。当容器`type`为`cube`时有效。

### polyhedron

多面体参数。

#### radius

多面体粒径，即多面体外接球半径。

#### sharpness (无效参数)

多面体尖锐度，由长径比替代，请使用`slenderness_ratio`。

#### slenderness_ratio

多面体长径比，多面体内最长对角线与最短对角线之比。

### show_window

显示3D参考场景，一般在使用物理引擎模拟时开启。

### random_iter_count

随机投放迭代次数。

### high_volume_ratio(测试)

高填充率模式，随机度不理想，不建议使用。该模式下会首先进行一次搞填充率投放，即以较高的规则度投放规则多面体。

### enable_simulation

开启物理引擎模拟模式。开启该参数后，每投放一轮（`random_iter_count`次迭代为一轮投放）后会进行`simulation_interval`毫秒的物理引擎模拟，所有多面体将根据随机方向上的重力进行碰撞和位移。
该模式下有一定几率造成多面体重叠，减少多面体重叠的方法是减少模拟时间，即减少`simulation_interval`参数的数值，但该数值较小又会导致模拟效果不佳。

### simulation_interval

物理引擎模拟间隔，即在每轮投放后进行的模拟时长。

### simulation_interval_count

物理引擎模拟模式下投放轮数。模拟是在每轮投放之间进行。无论该参数是否为0，在模拟模式下都至少进行一轮投放。
