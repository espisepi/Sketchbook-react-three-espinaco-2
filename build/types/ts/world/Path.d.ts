import { PathNode } from './PathNode';
import { Object3D } from 'three';
export declare class Path {
    nodes: {
        [nodeName: string]: PathNode;
    };
    private rootNode;
    constructor(root: Object3D);
    addNode(child: any): void;
    connectNodes(): void;
}
