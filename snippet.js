var init = () => {
    const personList = [{
        firstName: 'John',
        lastName: 'Doe',
        age: 25
    }, {
        firstName: 'Jane',
        lastName: 'Doe',
        age: 25
    }, {
        firstName: 'Jean-François',
        lastName: 'Garreau',
        age: 34
    }, {
        firstName: 'Julien',
        lastName: 'Landure',
        age: 34
    }];

    const namesOlders = personList
        .filter((person) => person.age > 30)
        .map((person) => {
            return {
                name: `${person.firstName} ${person.lastName}`
            };
        });

    console.table(namesOlders);


    const superLog = (chaine) => {
        console.info(Date.now, chaine);
    }
}

init();