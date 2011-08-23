#ifndef BASE_JS
#define BASE_JS

//Base class begins here.
Mine.Base = function(){

  var base = {}

  //Holds what classes the object is.
  base._classes = Array();


  //Adds a class to the list of classes the object is.
  base._addClass = function(new_class){
    this._classes.push(new_class);
  }

  //Returns if an object is a member of the given class.
  base._isA = function(class_name){
    for(a_class in this._classes){

      //If class is found in list, it is one.
      if(class_name == this._classes[a_class]){
        return true;
      }

    }

    //If class is not found ,it is not.
    return false;
  };

  base._addClass(Mine.Base);
  return base;
}


#endif
