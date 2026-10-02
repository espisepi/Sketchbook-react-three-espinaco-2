import { PathNode } from './PathNode';
import { Object3D } from 'three';

export class Path
{
	public nodes: {[nodeName: string]: PathNode} = {};
	private rootNode: Object3D;

	constructor(root: Object3D)
	{
		this.rootNode = root;

		this.rootNode.traverse((child) => {
			this.addNode(child);
		});

		this.connectNodes();
	}

	public addNode(child: any): void
	{
		if (child.hasOwnProperty('userData') && child.userData.hasOwnProperty('data'))
		{
			if (child.userData.data === 'pathNode')
			{
				let node = new PathNode(child, this);
				this.nodes[child.name] = node;
			}
		}
	}

	public connectNodes(): void
	{
		for (const nodeName in this.nodes)
		{
			if (this.nodes.hasOwnProperty(nodeName))
			{
				const node = this.nodes[nodeName];
				node.nextNode = this.nodes[node.object.userData.nextNode];
				node.previousNode = this.nodes[node.object.userData.previousNode];
			}
		}
	}
}