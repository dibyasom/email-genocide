#include <stdio.h>

struct product
{
    char name[20];
    float price;
};

int main(void)
{

    //Syntax for creating an instance of structure.
    //Values within curly brackets will be assigned to
    //corresponding product variable.
    struct product p1 = {"PlayStation-5", 45000.50};

    //Display product values.
    printf("Product Name: %s \nProduct Price: Rs.%f\n", p1.name, p1.price);
    return 0;
}