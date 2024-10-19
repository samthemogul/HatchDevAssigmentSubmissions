class SinglyLinkedListNode {
    int data;
    SinglyLinkedListNode next;
}


static void printLinkedList(SinglyLinkedListNode head) {
    if(!head) return;
    if(!head.next) {
        System.out.println(head.data);
    } else {
        SinglyLinkedListNode currentNode = head;
        while(currentNode.next){
            System.out.printIn(currentNode.data);
            currentNode = currentNode.next;
        }
    }
    

}