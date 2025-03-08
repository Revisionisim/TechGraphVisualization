#include <stdio.h>
//快速排序算法
void quick_sort(int *arr, int left, int right)
{
    if (left >= right)
        return;
    int i = left;
    int j = right;
    int key = arr[left];
    while (i < j)
    {
        while (i < j && arr[j] >= key)
            j--;
        arr[i] = arr[j];
        while (i < j && arr[i] <= key)
            i++;
        arr[j] = arr[i];
    }
    arr[i] = key;
    quick_sort(arr, left, i - 1);
    quick_sort(arr, i + 1, right);
}
int main()
{
    int arr[] = {1, 3, 5, 7, 9, 2, 4, 6, 8, 0};
    int len = sizeof(arr) / sizeof(arr[0]);
    quick_sort(arr, 0, len - 1);
    for (int i = 0; i < len; i++)
        printf("%d ", arr[i]);
    printf("\n");
    return 0;
}
